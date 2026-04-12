import { VideoGenerationResult } from '@reevio/types';
import { StorageService } from '../storage/storage.types';
import { GenerateVideoInput, VideoProvider } from './video-provider.types';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_VIDEO_MODEL = 'veo-3.1-generate-preview';
const POLL_INTERVAL_MS = 10000;
const MAX_POLL_ATTEMPTS = 90;

interface GeminiGenerateOperation {
  readonly name?: string;
}

interface GeminiOperationStatus {
  readonly done?: boolean;
  readonly error?: {
    readonly message?: string;
  };
  readonly response?: {
    readonly generateVideoResponse?: {
      readonly generatedSamples?: Array<{
        readonly video?: {
          readonly uri?: string;
        };
      }>;
    };
    readonly generatedVideos?: Array<{
      readonly video?: {
        readonly uri?: string;
      };
    }>;
  };
}

export class GeminiProvider implements VideoProvider {
  public readonly name = 'gemini' as const;

  public constructor(
    private readonly apiKey: string | undefined,
    private readonly storageService: StorageService
  ) {}

  public async generateVideo(input: GenerateVideoInput): Promise<VideoGenerationResult> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is required for GeminiProvider.');
    }

    const prompt = createGeminiVideoPrompt(input);
    const operation = await this.startVideoGeneration(prompt, input.aspectRatio);
    const videoDownloadUrl = await this.waitForGeneratedVideo(operation.name);
    const videoBytes = await this.downloadVideo(videoDownloadUrl);
    const outputUrl = await this.storageService.saveBinaryFile(
      `videos/gemini/${input.videoId}.mp4`,
      videoBytes
    );

    return {
      provider: this.name,
      url: outputUrl,
      previewUrl: outputUrl,
      durationInSeconds: input.orchestratedPlan.durationInSeconds,
      artifactKind: 'video',
    };
  }

  private async startVideoGeneration(
    prompt: string,
    aspectRatio: GenerateVideoInput['aspectRatio']
  ): Promise<Required<GeminiGenerateOperation>> {
    const response = await fetch(
      `${GEMINI_API_BASE_URL}/models/${GEMINI_VIDEO_MODEL}:predictLongRunning`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': this.apiKey as string,
        },
        body: JSON.stringify({
          instances: [
            {
              prompt,
            },
          ],
          parameters: {
            aspectRatio,
            resolution: '720p',
          },
        }),
      }
    );

    const payload = (await response.json().catch(() => null)) as GeminiGenerateOperation | null;

    if (!response.ok || !payload?.name) {
      throw new Error(
        `Gemini video generation request failed: ${await getResponseErrorMessage(response, payload)}`
      );
    }

    return {
      name: payload.name,
    };
  }

  private async waitForGeneratedVideo(operationName: string): Promise<string> {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
      if (attempt > 0) {
        await delay(POLL_INTERVAL_MS);
      }

      const response = await fetch(`${GEMINI_API_BASE_URL}/${operationName}`, {
        headers: {
          'x-goog-api-key': this.apiKey as string,
        },
      });
      const payload = (await response.json().catch(() => null)) as GeminiOperationStatus | null;

      if (!response.ok || payload === null) {
        throw new Error(
          `Gemini operation polling failed: ${await getResponseErrorMessage(response, payload)}`
        );
      }

      if (payload.error?.message) {
        throw new Error(`Gemini video generation failed: ${payload.error.message}`);
      }

      if (!payload.done) {
        continue;
      }

      const downloadUrl = getGeneratedVideoUrl(payload);

      if (!downloadUrl) {
        throw new Error('Gemini completed without returning a downloadable video URL.');
      }

      return downloadUrl;
    }

    throw new Error(
      `Gemini video generation did not finish after ${(MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS) / 1000} seconds.`
    );
  }

  private async downloadVideo(downloadUrl: string): Promise<Uint8Array> {
    const response = await fetch(downloadUrl, {
      headers: {
        'x-goog-api-key': this.apiKey as string,
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Gemini video download failed: ${await getResponseErrorMessage(response)}`);
    }

    const buffer = await response.arrayBuffer();

    return new Uint8Array(buffer);
  }
}

function createGeminiVideoPrompt(input: GenerateVideoInput): string {
  const sceneSummary = input.orchestratedPlan.scenes
    .slice(0, 4)
    .map(
      (scene, index) =>
        `Scene ${index + 1}: ${scene.headline}. ${scene.visualPrompt}. Narration: ${scene.narration}.`
    )
    .join(' ');

  return [
    `Create a polished short-form marketing video titled "${input.orchestratedPlan.title}".`,
    `Tagline: ${input.orchestratedPlan.tagline}.`,
    `Overall script: ${input.orchestratedPlan.script}.`,
    `Scene direction: ${sceneSummary}`,
    'The result should look like a finished vertical social video with coherent cinematic motion and clean product storytelling.',
  ]
    .join(' ')
    .replace(/\s+/g, ' ')
    .slice(0, 4000);
}

function getGeneratedVideoUrl(payload: GeminiOperationStatus): string | null {
  const restUrl =
    payload.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri ?? null;
  const sdkUrl = payload.response?.generatedVideos?.[0]?.video?.uri ?? null;

  return restUrl ?? sdkUrl;
}

async function getResponseErrorMessage(
  response: Response,
  payload?: unknown
): Promise<string> {
  const payloadMessage = extractErrorMessage(payload);

  if (payloadMessage) {
    return payloadMessage;
  }

  const responseText = await response.text().catch(() => '');

  return responseText || `${response.status} ${response.statusText}`;
}

function extractErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if ('error' in payload && payload.error && typeof payload.error === 'object') {
    const errorObject = payload.error as { message?: unknown };

    if (typeof errorObject.message === 'string' && errorObject.message.length > 0) {
      return errorObject.message;
    }
  }

  return null;
}

function delay(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}
