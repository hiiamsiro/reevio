import { VideoGenerationResult } from '@reevio/types';
import { GenerateVideoInput, VideoProvider } from './video-provider.types';

export class GrokProvider implements VideoProvider {
  public readonly name = 'grok' as const;

  public async generateVideo(input: GenerateVideoInput): Promise<VideoGenerationResult> {
    const outputUrl = `storage://generated/videos/grok/${input.videoId}.mp4`;

    return {
      provider: this.name,
      url: outputUrl,
      previewUrl: outputUrl,
      durationInSeconds: Math.max(input.orchestratedPlan.durationInSeconds - 1, 6),
    };
  }
}
