import { describe, expect, it, vi } from 'vitest';
import type {
  GeneratedImageProvider,
  GeneratedImageSourceKind,
  VideoAspectRatio,
} from '@reevio/types';
import { resolveProviderOrder } from './create-image-assets';
import { ImageProviderOrchestrator } from './image-provider-orchestrator';
import { ImageProviderError, type ImageProvider } from './image-provider.types';
import { MemoryImageProviderRuntimeStore } from './provider-runtime-store';
import type { StorageService } from '../storage/storage.types';

describe('ImageProviderOrchestrator', () => {
  it('uses the next configured provider when an earlier provider is unavailable', async () => {
    const storage = createStorageServiceMock();
    const cloudflare = createProvider({
      name: 'cloudflare',
      sourceKind: 'generated',
      configured: false,
      handler: async () => createValidCandidate('cloudflare', 'generated'),
    });
    const huggingface = createProvider({
      name: 'huggingface',
      sourceKind: 'generated',
      handler: async () => createValidCandidate('huggingface', 'generated'),
    });

    const orchestrator = createOrchestrator({
      providers: [cloudflare, huggingface],
      storage,
      providerOrder: ['cloudflare', 'huggingface'],
    });

    const result = await orchestrator.resolveAssets(['bright skincare product on clean desk']);

    expect(result.assets[0]?.provider).toBe('huggingface');
    expect(result.imageProviderChain).toEqual(['huggingface']);
    expect(cloudflare.resolveImage).not.toHaveBeenCalled();
  });

  it('marks retryable provider failures as cooldown and skips them on later scenes', async () => {
    const storage = createStorageServiceMock();
    const cloudflare = createProvider({
      name: 'cloudflare',
      sourceKind: 'generated',
      handler: async () => {
        throw new ImageProviderError({
          provider: 'cloudflare',
          retryable: true,
          statusCode: 429,
          message: 'Cloudflare rate limited the request.',
        });
      },
    });
    const huggingface = createProvider({
      name: 'huggingface',
      sourceKind: 'generated',
      handler: async () => createValidCandidate('huggingface', 'generated'),
    });

    const orchestrator = createOrchestrator({
      providers: [cloudflare, huggingface],
      storage,
      providerOrder: ['cloudflare', 'huggingface'],
    });

    const result = await orchestrator.resolveAssets([
      'scene one product hero image',
      'scene two product hero image',
    ]);

    expect(result.assets).toHaveLength(2);
    expect(result.assets.every((asset) => asset.provider === 'huggingface')).toBe(true);
    expect(result.imageResolutionAttempts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          provider: 'cloudflare',
          status: 'failed',
          retryable: true,
        }),
        expect.objectContaining({
          provider: 'cloudflare',
          status: 'skipped',
          reason: 'provider-cooldown',
        }),
      ])
    );
    expect(result.providerFailures).toEqual([
      expect.objectContaining({
        provider: 'cloudflare',
        failures: 1,
        retryableFailures: 1,
      }),
    ]);
  });

  it('falls back from generated providers to stock providers in order', async () => {
    const storage = createStorageServiceMock();
    const cloudflare = createProvider({
      name: 'cloudflare',
      sourceKind: 'generated',
      handler: async () => {
        throw new ImageProviderError({
          provider: 'cloudflare',
          retryable: true,
          message: 'Temporary Cloudflare outage.',
        });
      },
    });
    const huggingface = createProvider({
      name: 'huggingface',
      sourceKind: 'generated',
      handler: async () => {
        throw new ImageProviderError({
          provider: 'huggingface',
          retryable: true,
          message: 'Temporary Hugging Face outage.',
        });
      },
    });
    const pexels = createProvider({
      name: 'pexels',
      sourceKind: 'stock',
      handler: async () => ({
        provider: 'pexels',
        sourceKind: 'stock',
        bytes: createPngBytes(1280, 720),
        mimeType: 'image/png',
        searchQuery: 'scene stock image',
      }),
    });
    const pixabay = createProvider({
      name: 'pixabay',
      sourceKind: 'stock',
      handler: async () => createValidCandidate('pixabay', 'stock'),
    });

    const orchestrator = createOrchestrator({
      providers: [cloudflare, huggingface, pexels, pixabay],
      storage,
      providerOrder: ['cloudflare', 'huggingface', 'pexels', 'pixabay'],
    });

    const result = await orchestrator.resolveAssets(['vertical product lifestyle']);

    expect(result.assets[0]?.provider).toBe('pixabay');
    expect(result.imageResolutionAttempts.map((attempt) => attempt.provider)).toEqual([
      'cloudflare',
      'huggingface',
      'pexels',
      'pixabay',
    ]);
  });

  it('throws IMAGE_PROVIDERS_EXHAUSTED when the full provider chain fails', async () => {
    const failingProviders = createAllFailingProviders();
    const orchestrator = createOrchestrator({
      providers: failingProviders,
      storage: createStorageServiceMock(),
      providerOrder: ['cloudflare', 'huggingface', 'pexels', 'pixabay'],
    });

    await expect(
      orchestrator.resolveAssets(['launch teaser image for product'])
    ).rejects.toThrow('IMAGE_PROVIDERS_EXHAUSTED');
  });
});

describe('resolveProviderOrder', () => {
  it('filters unknown provider names and preserves the configured order', () => {
    expect(resolveProviderOrder('pixabay,unknown,pexels')).toEqual([
      'pixabay',
      'pexels',
    ]);
  });
});

function createOrchestrator(options: {
  readonly providerOrder: GeneratedImageProvider[];
  readonly providers: ImageProvider[];
  readonly storage: StorageService;
}) {
  return new ImageProviderOrchestrator({
    aspectRatio: '9:16',
    providerOrder: options.providerOrder,
    providers: options.providers,
    runtimeStore: new MemoryImageProviderRuntimeStore(120),
    storageService: options.storage,
    timeoutMs: 1000,
    videoId: 'video-123',
  });
}

function createProvider(options: {
  readonly configured?: boolean;
  readonly handler: (
    aspectRatio: VideoAspectRatio
  ) => Promise<ReturnType<typeof createValidCandidate>>;
  readonly name: GeneratedImageProvider;
  readonly sourceKind: GeneratedImageSourceKind;
}) {
  return {
    name: options.name,
    sourceKind: options.sourceKind,
    isConfigured: () => options.configured ?? true,
    resolveImage: vi.fn(async (request) => options.handler(request.aspectRatio)),
  } satisfies ImageProvider & { resolveImage: ReturnType<typeof vi.fn> };
}

function createAllFailingProviders(): ImageProvider[] {
  return (['cloudflare', 'huggingface', 'pexels', 'pixabay'] as const).map((name) =>
    createProvider({
      name,
      sourceKind: name === 'cloudflare' || name === 'huggingface' ? 'generated' : 'stock',
      handler: async () => {
        throw new ImageProviderError({
          provider: name,
          retryable: false,
          message: `${name} failed`,
        });
      },
    })
  );
}

function createStorageServiceMock(): StorageService {
  return {
    saveBinaryFile: vi.fn(async (relativePath: string) => `http://localhost:4000/storage/${relativePath}`),
    savePlaceholderImage: vi.fn(async () => 'http://localhost:4000/storage/placeholder.png'),
    saveTextFile: vi.fn(async () => 'http://localhost:4000/storage/file.txt'),
    compressJsonArtifact: vi.fn(async () => undefined),
  };
}

function createValidCandidate(
  provider: GeneratedImageProvider,
  sourceKind: GeneratedImageSourceKind
) {
  return {
    provider,
    sourceKind,
    bytes: createPngBytes(720, 1280),
    mimeType: 'image/png',
    searchQuery: sourceKind === 'stock' ? 'vertical product' : undefined,
  };
}

function createPngBytes(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(24);

  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  bytes.set([0x00, 0x00, 0x00, 0x0d], 8);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  bytes[16] = (width >>> 24) & 0xff;
  bytes[17] = (width >>> 16) & 0xff;
  bytes[18] = (width >>> 8) & 0xff;
  bytes[19] = width & 0xff;
  bytes[20] = (height >>> 24) & 0xff;
  bytes[21] = (height >>> 16) & 0xff;
  bytes[22] = (height >>> 8) & 0xff;
  bytes[23] = height & 0xff;

  return bytes;
}
