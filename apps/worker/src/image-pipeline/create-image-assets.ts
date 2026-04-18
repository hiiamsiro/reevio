import type { Redis } from 'ioredis';
import type { VideoAspectRatio } from '@reevio/types';
import { ImageProviderOrchestrator } from './image-provider-orchestrator';
import { type ImageAssetPipelineResult } from './image-provider.types';
import { CloudflareImageProvider } from './providers/cloudflare-image-provider';
import { HuggingFaceImageProvider } from './providers/huggingface-image-provider';
import { PexelsImageProvider } from './providers/pexels-image-provider';
import { PixabayImageProvider } from './providers/pixabay-image-provider';
import { RedisImageProviderRuntimeStore } from './provider-runtime-store';
import type { StorageService } from '../storage/storage.types';

interface CreateImageAssetsInput {
  readonly aspectRatio: VideoAspectRatio;
  readonly imagePrompts: string[];
  readonly redis: Redis;
  readonly storageService: StorageService;
  readonly videoId: string;
}

const SUPPORTED_PROVIDER_ORDER = ['cloudflare', 'huggingface', 'pexels', 'pixabay'] as const;

export type { ImageAssetPipelineResult } from './image-provider.types';

export async function createImageAssets(
  input: CreateImageAssetsInput
): Promise<ImageAssetPipelineResult> {
  const providerOrder = resolveProviderOrder(
    process.env['IMAGE_PROVIDER_ORDER'] ?? 'cloudflare,huggingface,pexels,pixabay'
  );
  const orchestrator = new ImageProviderOrchestrator({
    aspectRatio: input.aspectRatio,
    providerOrder,
    providers: [
      new CloudflareImageProvider({
        accountId: process.env['CF_ACCOUNT_ID'],
        apiToken: process.env['CF_API_TOKEN'],
        model:
          process.env['CF_IMAGE_MODEL'] ?? '@cf/black-forest-labs/flux-1-schnell',
      }),
      new HuggingFaceImageProvider({
        apiKey: process.env['HF_API_KEY'],
        model: process.env['HF_IMAGE_MODEL'] ?? 'black-forest-labs/FLUX.1-schnell',
      }),
      new PexelsImageProvider({
        apiKey: process.env['PEXELS_API_KEY'],
      }),
      new PixabayImageProvider({
        apiKey: process.env['PIXABAY_API_KEY'],
      }),
    ],
    runtimeStore: new RedisImageProviderRuntimeStore(
      input.redis,
      Number.parseInt(process.env['IMAGE_PROVIDER_COOLDOWN_SECONDS'] ?? '300', 10)
    ),
    storageService: input.storageService,
    timeoutMs: Number.parseInt(process.env['IMAGE_PROVIDER_TIMEOUT_MS'] ?? '25000', 10),
    videoId: input.videoId,
  });

  return orchestrator.resolveAssets(input.imagePrompts);
}

export function resolveProviderOrder(
  rawProviderOrder: string
): Array<(typeof SUPPORTED_PROVIDER_ORDER)[number]> {
  const providerOrder = rawProviderOrder
    .split(',')
    .map((provider) => provider.trim().toLowerCase())
    .filter((provider): provider is (typeof SUPPORTED_PROVIDER_ORDER)[number] =>
      SUPPORTED_PROVIDER_ORDER.includes(provider as (typeof SUPPORTED_PROVIDER_ORDER)[number])
    );

  return providerOrder.length > 0 ? providerOrder : [...SUPPORTED_PROVIDER_ORDER];
}
