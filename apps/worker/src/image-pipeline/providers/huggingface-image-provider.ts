import {
  InferenceClient,
  InferenceClientHubApiError,
  InferenceClientInputError,
  InferenceClientProviderApiError,
  InferenceClientProviderOutputError,
  InferenceClientRoutingError,
} from '@huggingface/inference';
import { ImageProviderError } from '../image-provider.types';
import type { ImageCandidate, ImageProvider, ImageProviderRequest } from '../image-provider.types';

interface HuggingFaceImageProviderOptions {
  readonly apiKey?: string | undefined;
  readonly model: string;
}

export class HuggingFaceImageProvider implements ImageProvider {
  public readonly name = 'huggingface' as const;
  public readonly sourceKind = 'generated' as const;

  private readonly client: InferenceClient | null;

  public constructor(private readonly options: HuggingFaceImageProviderOptions) {
    this.client = options.apiKey ? new InferenceClient(options.apiKey) : null;
  }

  public isConfigured(): boolean {
    return this.client !== null && this.options.model.length > 0;
  }

  public async resolveImage(request: ImageProviderRequest): Promise<ImageCandidate> {
    if (!this.client) {
      throw new ImageProviderError({
        provider: this.name,
        message: 'Hugging Face image provider is not configured.',
        retryable: false,
      });
    }

    try {
      const imageBlob = await this.client.textToImage({
        model: this.options.model,
        inputs: request.prompt,
        parameters: {
          num_inference_steps: 5,
        },
      }, {
        outputType: 'blob',
      });

      return {
        provider: this.name,
        sourceKind: this.sourceKind,
        bytes: new Uint8Array(await imageBlob.arrayBuffer()),
        mimeType: imageBlob.type || 'image/png',
      };
    } catch (error: unknown) {
      throw toHuggingFaceProviderError(error);
    }
  }
}

function toHuggingFaceProviderError(error: unknown): ImageProviderError {
  if (
    error instanceof InferenceClientProviderApiError ||
    error instanceof InferenceClientHubApiError
  ) {
    const statusCode = error.httpResponse.status;
    return new ImageProviderError({
      provider: 'huggingface',
      retryable: statusCode === 429 || statusCode >= 500,
      statusCode,
      message: error.message,
    });
  }

  if (
    error instanceof InferenceClientInputError ||
    error instanceof InferenceClientRoutingError ||
    error instanceof InferenceClientProviderOutputError
  ) {
    return new ImageProviderError({
      provider: 'huggingface',
      retryable: false,
      message: error.message,
    });
  }

  if (error instanceof Error) {
    return new ImageProviderError({
      provider: 'huggingface',
      retryable: true,
      message: error.message,
    });
  }

  return new ImageProviderError({
    provider: 'huggingface',
    retryable: true,
    message: 'Unknown Hugging Face image provider error.',
  });
}
