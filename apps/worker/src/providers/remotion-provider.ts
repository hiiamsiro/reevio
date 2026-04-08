import { VideoGenerationResult } from '@reevio/types';
import { GenerateVideoInput, VideoProvider } from './video-provider.types';

export class RemotionProvider implements VideoProvider {
  public readonly name = 'remotion' as const;

  public async generateVideo(input: GenerateVideoInput): Promise<VideoGenerationResult> {
    const outputUrl = `storage://generated/videos/${input.videoId}.mp4`;

    return {
      provider: this.name,
      url: outputUrl,
      previewUrl: outputUrl,
      durationInSeconds:
        input.builtScenes.reduce((total, scene) => total + scene.durationInSeconds, 0) ||
        input.orchestratedPlan.durationInSeconds,
    };
  }
}
