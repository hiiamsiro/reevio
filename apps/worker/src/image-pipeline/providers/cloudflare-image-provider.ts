import type { VideoAspectRatio } from '@reevio/types';
import { ImageProviderError } from '../image-provider.types';
import type { ImageCandidate, ImageProvider, ImageProviderRequest } from '../image-provider.types';

interface CloudflareImageProviderOptions {
  readonly accountId?: string | undefined;
  readonly apiToken?: string | undefined;
  readonly model: string;
}

export class CloudflareImageProvider implements ImageProvider {
  public readonly name = 'cloudflare' as const;
  public readonly sourceKind = 'generated' as const;

  public constructor(private readonly options: CloudflareImageProviderOptions) {}

  public isConfigured(): boolean {
    return Boolean(this.options.accountId && this.options.apiToken && this.options.model);
  }

  public async resolveImage(request: ImageProviderRequest): Promise<ImageCandidate> {
    if (!this.isConfigured()) {
      throw new ImageProviderError({
        provider: this.name,
        message: 'Cloudflare image provider is not configured.',
        retryable: false,
      });
    }

    const dimensions = getGenerationDimensions(request.aspectRatio);
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.options.accountId}/ai/run/${this.options.model}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.options.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          width: dimensions.width,
          height: dimensions.height,
        }),
      }
    );

    if (!response.ok) {
      throw buildHttpError(this.name, response.status, await response.text());
    }

    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';

    if (contentType.startsWith('image/')) {
      return {
        provider: this.name,
        sourceKind: this.sourceKind,
        bytes: new Uint8Array(await response.arrayBuffer()),
        mimeType: contentType,
      };
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const encodedImage = extractBase64Image(payload);

    return {
      provider: this.name,
      sourceKind: this.sourceKind,
      bytes: Uint8Array.from(Buffer.from(encodedImage.base64, 'base64')),
      mimeType: encodedImage.mimeType,
    };
  }
}

function getGenerationDimensions(aspectRatio: VideoAspectRatio): {
  readonly height: number;
  readonly width: number;
} {
  switch (aspectRatio) {
    case '16:9':
      return { width: 1280, height: 720 };
    case '9:16':
      return { width: 720, height: 1280 };
    case '1:1':
      return { width: 1024, height: 1024 };
    case '4:5':
      return { width: 896, height: 1120 };
  }
}

function extractBase64Image(payload: Record<string, unknown>): {
  readonly base64: string;
  readonly mimeType: string;
} {
  const candidates = [payload['result'], payload['output'], payload['image']];

  for (const candidate of candidates) {
    const extracted = extractFromUnknown(candidate);

    if (extracted) {
      return extracted;
    }
  }

  throw new ImageProviderError({
    provider: 'cloudflare',
    message: 'Cloudflare image response did not contain an image payload.',
    retryable: false,
  });
}

function extractFromUnknown(
  value: unknown
): { readonly base64: string; readonly mimeType: string } | null {
  if (typeof value === 'string') {
    return parseBase64ImageString(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const extracted = extractFromUnknown(item);

      if (extracted) {
        return extracted;
      }
    }
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;

    for (const key of ['image', 'b64_json', 'data']) {
      const extracted = extractFromUnknown(record[key]);

      if (extracted) {
        return extracted;
      }
    }
  }

  return null;
}

function parseBase64ImageString(
  value: string
): { readonly base64: string; readonly mimeType: string } | null {
  const dataUriMatch = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (dataUriMatch) {
    return {
      mimeType: dataUriMatch[1]!.toLowerCase(),
      base64: dataUriMatch[2]!,
    };
  }

  if (/^[A-Za-z0-9+/=\r\n]+$/.test(value.trim())) {
    return {
      mimeType: 'image/png',
      base64: value.trim(),
    };
  }

  return null;
}

function buildHttpError(
  provider: 'cloudflare',
  statusCode: number,
  responseBody: string
): ImageProviderError {
  const retryable = statusCode === 429 || statusCode >= 500;
  return new ImageProviderError({
    provider,
    retryable,
    statusCode,
    message: `Cloudflare image request failed with status ${statusCode}: ${responseBody.slice(0, 300)}`,
  });
}
