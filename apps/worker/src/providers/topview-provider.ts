import { VideoGenerationResult } from '@reevio/types';
import { GenerateVideoInput, VideoProvider } from './video-provider.types';

export class TopviewProvider implements VideoProvider {
  public readonly name = 'topview' as const;

  public constructor(private readonly apiKey: string | undefined) {}

  public async generateVideo(input: GenerateVideoInput): Promise<VideoGenerationResult> {
    if (!this.apiKey) {
      throw new Error('TOPVIEW_API_KEY is required for TopviewProvider.');
    }

    const outputUrl = `storage://generated/videos/topview/${input.videoId}.mp4`;

    return {
      provider: this.name,
      url: outputUrl,
      previewUrl: outputUrl,
      durationInSeconds: input.orchestratedPlan.durationInSeconds,
    };
  }
}
