import { ImageProviderError } from '../image-provider.types';
import type { ImageCandidate, ImageProvider, ImageProviderRequest } from '../image-provider.types';

interface PixabayImageProviderOptions {
  readonly apiKey?: string | undefined;
}

interface PixabaySearchResponse {
  readonly hits?: readonly {
    readonly fullHDURL?: string;
    readonly imageHeight?: number;
    readonly imageWidth?: number;
    readonly largeImageURL?: string;
    readonly pageURL?: string;
    readonly user?: string;
    readonly webformatHeight?: number;
    readonly webformatURL?: string;
    readonly webformatWidth?: number;
  }[];
}

export class PixabayImageProvider implements ImageProvider {
  public readonly name = 'pixabay' as const;
  public readonly sourceKind = 'stock' as const;

  public constructor(private readonly options: PixabayImageProviderOptions) {}

  public isConfigured(): boolean {
    return Boolean(this.options.apiKey);
  }

  public async resolveImage(request: ImageProviderRequest): Promise<ImageCandidate> {
    if (!this.isConfigured()) {
      throw new ImageProviderError({
        provider: this.name,
        message: 'Pixabay image provider is not configured.',
        retryable: false,
      });
    }

    const orientation = request.aspectRatio === '16:9' ? 'horizontal' : 'vertical';
    const searchParams = new URLSearchParams({
      key: this.options.apiKey!,
      q: request.searchQuery,
      image_type: 'photo',
      orientation,
      per_page: '5',
      safesearch: 'true',
    });
    const response = await fetch(`https://pixabay.com/api/?${searchParams.toString()}`);

    if (!response.ok) {
      throw buildHttpError(this.name, response.status, await response.text());
    }

    const payload = (await response.json()) as PixabaySearchResponse;
    const hit = payload.hits?.find(
      (item) => item.fullHDURL || item.largeImageURL || item.webformatURL
    );

    if (!hit) {
      throw new ImageProviderError({
        provider: this.name,
        message: `Pixabay did not return an image for query "${request.searchQuery}".`,
        retryable: false,
      });
    }

    return {
      provider: this.name,
      sourceKind: this.sourceKind,
      attribution: hit.user ? `${hit.user}${hit.pageURL ? ` (${hit.pageURL})` : ''}` : undefined,
      downloadUrl: hit.fullHDURL ?? hit.largeImageURL ?? hit.webformatURL,
      height: hit.imageHeight ?? hit.webformatHeight,
      searchQuery: request.searchQuery,
      width: hit.imageWidth ?? hit.webformatWidth,
    };
  }
}

function buildHttpError(
  provider: 'pixabay',
  statusCode: number,
  responseBody: string
): ImageProviderError {
  return new ImageProviderError({
    provider,
    retryable: statusCode === 429 || statusCode >= 500,
    statusCode,
    message: `Pixabay image request failed with status ${statusCode}: ${responseBody.slice(0, 300)}`,
  });
}
