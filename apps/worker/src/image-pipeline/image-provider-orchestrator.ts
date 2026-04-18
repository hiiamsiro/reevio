import type { GeneratedImageAsset, GeneratedImageProvider, VideoAspectRatio } from '@reevio/types';
import { inferFileExtension, validateImageBinary } from './image-binary';
import { normalizeSearchQuery } from './normalize-search-query';
import type {
  ImageAssetPipelineResult,
  ImageCandidate,
  ImageProvider,
  ImageProviderFailureSummary,
  ImageResolutionAttempt,
} from './image-provider.types';
import { ImageProviderError } from './image-provider.types';
import type { ImageProviderRuntimeStore } from './provider-runtime-store';
import type { StorageService } from '../storage/storage.types';

interface ImageProviderOrchestratorOptions {
  readonly aspectRatio: VideoAspectRatio;
  readonly providerOrder: readonly GeneratedImageProvider[];
  readonly providers: readonly ImageProvider[];
  readonly runtimeStore: ImageProviderRuntimeStore;
  readonly storageService: StorageService;
  readonly timeoutMs: number;
  readonly videoId: string;
}

export class ImageProviderOrchestrator {
  private readonly providerMap: ReadonlyMap<GeneratedImageProvider, ImageProvider>;

  public constructor(private readonly options: ImageProviderOrchestratorOptions) {
    this.providerMap = new Map(options.providers.map((provider) => [provider.name, provider]));
  }

  public async resolveAssets(imagePrompts: readonly string[]): Promise<ImageAssetPipelineResult> {
    const attempts: ImageResolutionAttempt[] = [];
    const assets: GeneratedImageAsset[] = [];
    const failureState = new Map<
      GeneratedImageProvider,
      { failures: number; lastError: string; retryableFailures: number }
    >();
    const usableProviderChain = this.options.providerOrder.filter((providerName) =>
      this.providerMap.get(providerName)?.isConfigured()
    );

    for (const [sceneIndex, prompt] of imagePrompts.entries()) {
      const asset = await this.resolveAssetForScene({
        attempts,
        failureState,
        prompt,
        sceneIndex,
      });
      assets.push(asset);
    }

    return {
      assets,
      imageProviderChain: usableProviderChain,
      imageResolutionAttempts: attempts,
      providerFailures: toFailureSummaries(failureState),
    };
  }

  private async resolveAssetForScene(options: {
    readonly attempts: ImageResolutionAttempt[];
    readonly failureState: Map<
      GeneratedImageProvider,
      { failures: number; lastError: string; retryableFailures: number }
    >;
    readonly prompt: string;
    readonly sceneIndex: number;
  }): Promise<GeneratedImageAsset> {
    const searchQuery = normalizeSearchQuery(options.prompt);

    for (const [fallbackDepth, providerName] of this.options.providerOrder.entries()) {
      const provider = this.providerMap.get(providerName);

      if (!provider || !provider.isConfigured()) {
        continue;
      }

      if (await this.options.runtimeStore.isCoolingDown(provider.name)) {
        options.attempts.push({
          sceneIndex: options.sceneIndex,
          prompt: options.prompt,
          provider: provider.name,
          sourceKind: provider.sourceKind,
          fallbackDepth,
          status: 'skipped',
          reason: 'provider-cooldown',
          retryable: true,
          searchQuery: provider.sourceKind === 'stock' ? searchQuery : undefined,
        });
        continue;
      }

      try {
        const candidate = await this.withTimeout(
          provider.resolveImage({
            aspectRatio: this.options.aspectRatio,
            prompt: options.prompt,
            searchQuery,
            sceneIndex: options.sceneIndex,
            timeoutMs: this.options.timeoutMs,
            videoId: this.options.videoId,
          }),
          provider.name
        );
        const asset = await this.finalizeCandidate(candidate, {
          fallbackDepth,
          prompt: options.prompt,
          sceneIndex: options.sceneIndex,
        });

        options.attempts.push({
          sceneIndex: options.sceneIndex,
          prompt: options.prompt,
          provider: provider.name,
          sourceKind: provider.sourceKind,
          fallbackDepth,
          status: 'success',
          reason: 'resolved',
          retryable: false,
          searchQuery: asset.searchQuery,
        });

        return asset;
      } catch (error: unknown) {
        const providerError = normalizeProviderError(provider.name, error);
        await this.options.runtimeStore.incrementFailure(provider.name);
        recordFailure(options.failureState, providerError);

        if (providerError.retryable) {
          await this.options.runtimeStore.startCooldown(provider.name, providerError.message);
        }

        options.attempts.push({
          sceneIndex: options.sceneIndex,
          prompt: options.prompt,
          provider: provider.name,
          sourceKind: provider.sourceKind,
          fallbackDepth,
          status: 'failed',
          reason: providerError.message,
          retryable: providerError.retryable,
          searchQuery: provider.sourceKind === 'stock' ? searchQuery : undefined,
        });
      }
    }

    throw new Error(
      `IMAGE_PROVIDERS_EXHAUSTED: No image provider could resolve scene ${options.sceneIndex + 1}.`
    );
  }

  private async finalizeCandidate(
    candidate: ImageCandidate,
    options: {
      readonly fallbackDepth: number;
      readonly prompt: string;
      readonly sceneIndex: number;
    }
  ): Promise<GeneratedImageAsset> {
    const binaryPayload = candidate.bytes
      ? {
          bytes: candidate.bytes,
          mimeType: candidate.mimeType ?? 'image/png',
        }
      : await this.downloadCandidate(candidate);

    const metadata = validateImageBinary({
      aspectRatio: this.options.aspectRatio,
      bytes: binaryPayload.bytes,
      expectedMimeType: binaryPayload.mimeType,
    });
    const extension = inferFileExtension(metadata.mimeType);
    const savedUrl = await this.options.storageService.saveBinaryFile(
      `images/${this.options.videoId}/scene-${options.sceneIndex + 1}-${candidate.provider}.${extension}`,
      binaryPayload.bytes
    );

    return {
      id: `${this.options.videoId}-asset-${options.sceneIndex + 1}-${candidate.provider}`,
      prompt: options.prompt,
      url: savedUrl,
      score: roundScore(options.fallbackDepth),
      provider: candidate.provider,
      sourceKind: candidate.sourceKind,
      fallbackDepth: options.fallbackDepth,
      attribution: candidate.attribution,
      searchQuery: candidate.searchQuery,
    };
  }

  private async downloadCandidate(candidate: ImageCandidate): Promise<{
    readonly bytes: Uint8Array;
    readonly mimeType: string;
  }> {
    if (!candidate.downloadUrl) {
      throw new ImageProviderError({
        provider: candidate.provider,
        message: 'Provider did not return image bytes or a download URL.',
        retryable: false,
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs);

    try {
      const response = await fetch(candidate.downloadUrl, { signal: controller.signal });

      if (!response.ok) {
        throw new ImageProviderError({
          provider: candidate.provider,
          retryable: response.status === 429 || response.status >= 500,
          statusCode: response.status,
          message: `Image download failed with status ${response.status}.`,
        });
      }

      const mimeType = response.headers.get('content-type')?.split(';')[0]?.toLowerCase();

      if (!mimeType?.startsWith('image/')) {
        throw new ImageProviderError({
          provider: candidate.provider,
          retryable: false,
          message: `Downloaded asset is not an image. Received content type "${mimeType ?? 'unknown'}".`,
        });
      }

      return {
        bytes: new Uint8Array(await response.arrayBuffer()),
        mimeType,
      };
    } catch (error: unknown) {
      if (error instanceof ImageProviderError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ImageProviderError({
          provider: candidate.provider,
          retryable: true,
          message: `Image download timed out after ${this.options.timeoutMs}ms.`,
        });
      }

      throw new ImageProviderError({
        provider: candidate.provider,
        retryable: true,
        message: error instanceof Error ? error.message : 'Unknown image download failure.',
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    provider: GeneratedImageProvider
  ): Promise<T> {
    let timeoutId: NodeJS.Timeout | undefined;

    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(
              new ImageProviderError({
                provider,
                retryable: true,
                message: `Provider timed out after ${this.options.timeoutMs}ms.`,
              })
            );
          }, this.options.timeoutMs);
        }),
      ]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }
}

function normalizeProviderError(
  provider: GeneratedImageProvider,
  error: unknown
): ImageProviderError {
  if (error instanceof ImageProviderError) {
    return error;
  }

  if (error instanceof Error) {
    return new ImageProviderError({
      provider,
      retryable: true,
      message: error.message,
    });
  }

  return new ImageProviderError({
    provider,
    retryable: true,
    message: 'Unknown image provider failure.',
  });
}

function recordFailure(
  failureState: Map<
    GeneratedImageProvider,
    { failures: number; lastError: string; retryableFailures: number }
  >,
  error: ImageProviderError
): void {
  const currentState = failureState.get(error.provider) ?? {
    failures: 0,
    lastError: '',
    retryableFailures: 0,
  };
  failureState.set(error.provider, {
    failures: currentState.failures + 1,
    lastError: error.message,
    retryableFailures: currentState.retryableFailures + (error.retryable ? 1 : 0),
  });
}

function toFailureSummaries(
  failureState: Map<
    GeneratedImageProvider,
    { failures: number; lastError: string; retryableFailures: number }
  >
): ImageProviderFailureSummary[] {
  return Array.from(failureState.entries()).map(([provider, state]) => ({
    provider,
    failures: state.failures,
    retryableFailures: state.retryableFailures,
    lastError: state.lastError,
  }));
}

function roundScore(fallbackDepth: number): number {
  return Number(Math.max(0.5, 0.98 - fallbackDepth * 0.08).toFixed(2));
}
