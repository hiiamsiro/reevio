import { VideoGenerationResult } from '@reevio/types';
import { GenerateVideoInput, VideoProvider } from './video-provider.types';

export class VeoProvider implements VideoProvider {
  public readonly name = 'veo' as const;

  public async generateVideo(input: GenerateVideoInput): Promise<VideoGenerationResult> {
    const outputUrl = `storage://generated/videos/veo/${input.videoId}.mp4`;

    return {
      provider: this.name,
      url: outputUrl,
      previewUrl: outputUrl,
      durationInSeconds: input.orchestratedPlan.durationInSeconds + 2,
    };
  }
}
