import { ImageProviderError } from '../image-provider.types';
import type { ImageCandidate, ImageProvider, ImageProviderRequest } from '../image-provider.types';

interface PexelsImageProviderOptions {
  readonly apiKey?: string | undefined;
}

interface PexelsSearchResponse {
  readonly photos?: readonly {
    readonly height: number;
    readonly photographer?: string;
    readonly photographer_url?: string;
    readonly src?: {
      readonly large2x?: string;
      readonly original?: string;
    };
    readonly width: number;
  }[];
}

export class PexelsImageProvider implements ImageProvider {
  public readonly name = 'pexels' as const;
  public readonly sourceKind = 'stock' as const;

  public constructor(private readonly options: PexelsImageProviderOptions) {}

  public isConfigured(): boolean {
    return Boolean(this.options.apiKey);
  }

  public async resolveImage(request: ImageProviderRequest): Promise<ImageCandidate> {
    if (!this.isConfigured()) {
      throw new ImageProviderError({
        provider: this.name,
        message: 'Pexels image provider is not configured.',
        retryable: false,
      });
    }

    const orientation = toPexelsOrientation(request.aspectRatio);
    const searchParams = new URLSearchParams({
      query: request.searchQuery,
      orientation,
      per_page: '5',
      size: 'large',
    });
    const response = await fetch(`https://api.pexels.com/v1/search?${searchParams.toString()}`, {
      headers: {
        Authorization: this.options.apiKey!,
      },
    });

    if (!response.ok) {
      throw buildHttpError(this.name, response.status, await response.text());
    }

    const payload = (await response.json()) as PexelsSearchResponse;
    const photo = payload.photos?.find((item) => item.src?.large2x || item.src?.original);

    if (!photo?.src) {
      throw new ImageProviderError({
        provider: this.name,
        message: `Pexels did not return an image for query "${request.searchQuery}".`,
        retryable: false,
      });
    }

    return {
      provider: this.name,
      sourceKind: this.sourceKind,
      attribution: photo.photographer
        ? `${photo.photographer}${photo.photographer_url ? ` (${photo.photographer_url})` : ''}`
        : undefined,
      downloadUrl: photo.src.large2x ?? photo.src.original,
      height: photo.height,
      searchQuery: request.searchQuery,
      width: photo.width,
    };
  }
}

function toPexelsOrientation(aspectRatio: ImageProviderRequest['aspectRatio']): string {
  switch (aspectRatio) {
    case '16:9':
      return 'landscape';
    case '9:16':
    case '4:5':
      return 'portrait';
    case '1:1':
      return 'square';
  }
}

function buildHttpError(
  provider: 'pexels',
  statusCode: number,
  responseBody: string
): ImageProviderError {
  return new ImageProviderError({
    provider,
    retryable: statusCode === 429 || statusCode >= 500,
    statusCode,
    message: `Pexels image request failed with status ${statusCode}: ${responseBody.slice(0, 300)}`,
  });
}
