import { VideoGenerationResult } from '@reevio/types';
import { GenerateVideoInput, VideoProvider } from './video-provider.types';

export class VeoProvider implements VideoProvider {
  public readonly name = 'veo' as const;

  public constructor(private readonly apiKey: string | undefined) {}

  public async generateVideo(input: GenerateVideoInput): Promise<VideoGenerationResult> {
    if (!this.apiKey) {
      throw new Error('VEO_API_KEY is required for VeoProvider.');
    }

    const outputUrl = `storage://generated/videos/veo/${input.videoId}.mp4`;

    return {
      provider: this.name,
      url: outputUrl,
      previewUrl: outputUrl,
      durationInSeconds: input.orchestratedPlan.durationInSeconds + 2,
    };
  }
}
