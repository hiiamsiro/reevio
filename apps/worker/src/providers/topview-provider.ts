import { VideoGenerationResult } from '@reevio/types';
import { GenerateVideoInput, VideoProvider } from './video-provider.types';

export class TopviewProvider implements VideoProvider {
  public readonly name = 'topview' as const;

  public async generateVideo(input: GenerateVideoInput): Promise<VideoGenerationResult> {
    const outputUrl = `storage://generated/videos/topview/${input.videoId}.mp4`;

    return {
      provider: this.name,
      url: outputUrl,
      previewUrl: outputUrl,
      durationInSeconds: input.orchestratedPlan.durationInSeconds,
    };
  }
}
