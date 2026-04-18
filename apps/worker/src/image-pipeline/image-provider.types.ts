import type {
  GeneratedImageAsset,
  GeneratedImageProvider,
  GeneratedImageSourceKind,
  VideoAspectRatio,
} from '@reevio/types';

export interface ImageProviderRequest {
  readonly aspectRatio: VideoAspectRatio;
  readonly prompt: string;
  readonly searchQuery: string;
  readonly sceneIndex: number;
  readonly timeoutMs: number;
  readonly videoId: string;
}

export interface ImageCandidate {
  readonly provider: GeneratedImageProvider;
  readonly sourceKind: GeneratedImageSourceKind;
  readonly attribution?: string | undefined;
  readonly bytes?: Uint8Array | undefined;
  readonly downloadUrl?: string | undefined;
  readonly height?: number | undefined;
  readonly mimeType?: string | undefined;
  readonly searchQuery?: string | undefined;
  readonly width?: number | undefined;
}

export interface ImageProvider {
  readonly name: GeneratedImageProvider;
  readonly sourceKind: GeneratedImageSourceKind;
  isConfigured(): boolean;
  resolveImage(request: ImageProviderRequest): Promise<ImageCandidate>;
}

export interface ImageResolutionAttempt {
  readonly fallbackDepth: number;
  readonly prompt: string;
  readonly provider: GeneratedImageProvider;
  readonly reason: string;
  readonly retryable: boolean;
  readonly sceneIndex: number;
  readonly searchQuery?: string | undefined;
  readonly sourceKind: GeneratedImageSourceKind;
  readonly status: 'success' | 'skipped' | 'failed';
}

export interface ImageProviderFailureSummary {
  readonly failures: number;
  readonly lastError: string;
  readonly provider: GeneratedImageProvider;
  readonly retryableFailures: number;
}

export interface ImageAssetPipelineResult {
  readonly assets: GeneratedImageAsset[];
  readonly imageProviderChain: GeneratedImageProvider[];
  readonly imageResolutionAttempts: ImageResolutionAttempt[];
  readonly providerFailures: ImageProviderFailureSummary[];
}

export class ImageProviderError extends Error {
  public readonly provider: GeneratedImageProvider;
  public readonly retryable: boolean;
  public readonly statusCode: number | null;

  public constructor(options: {
    provider: GeneratedImageProvider;
    message: string;
    retryable: boolean;
    statusCode?: number | null;
  }) {
    super(options.message);
    this.name = 'ImageProviderError';
    this.provider = options.provider;
    this.retryable = options.retryable;
    this.statusCode = options.statusCode ?? null;
  }
}
