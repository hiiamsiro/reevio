import { VideoGenerationResult } from '@reevio/types';
import { LocalStorageService } from '../storage/local-storage.service';
import { GenerateVideoInput, VideoProvider } from './video-provider.types';

export class VeoProvider implements VideoProvider {
  public readonly name = 'veo' as const;

  public constructor(
    private readonly apiKey: string | undefined,
    private readonly storageService: LocalStorageService
  ) {}

  public async generateVideo(input: GenerateVideoInput): Promise<VideoGenerationResult> {
    if (!this.apiKey) {
      throw new Error('VEO_API_KEY is required for VeoProvider.');
    }

    const outputUrl = await this.storageService.saveTextFile(
      `videos/veo/${input.videoId}.mp4`,
      JSON.stringify(
        {
          provider: this.name,
          videoId: input.videoId,
          cinematicMode: true,
        },
        null,
        2
      )
    );

    return {
      provider: this.name,
      url: outputUrl,
      previewUrl: outputUrl,
      durationInSeconds: input.orchestratedPlan.durationInSeconds + 2,
    };
  }
}
