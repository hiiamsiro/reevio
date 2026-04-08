import { VideoGenerationResult } from '@reevio/types';
import { LocalStorageService } from '../storage/local-storage.service';
import { GenerateVideoInput, VideoProvider } from './video-provider.types';

export class GrokProvider implements VideoProvider {
  public readonly name = 'grok' as const;

  public constructor(
    private readonly apiKey: string | undefined,
    private readonly storageService: LocalStorageService
  ) {}

  public async generateVideo(input: GenerateVideoInput): Promise<VideoGenerationResult> {
    if (!this.apiKey) {
      throw new Error('GROK_API_KEY is required for GrokProvider.');
    }

    const outputUrl = await this.storageService.saveTextFile(
      `videos/grok/${input.videoId}.mp4`,
      JSON.stringify(
        {
          provider: this.name,
          videoId: input.videoId,
          durationHint: input.orchestratedPlan.durationInSeconds,
        },
        null,
        2
      )
    );

    return {
      provider: this.name,
      url: outputUrl,
      previewUrl: outputUrl,
      durationInSeconds: Math.max(input.orchestratedPlan.durationInSeconds - 1, 6),
    };
  }
}
