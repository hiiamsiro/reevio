import { VideoGenerationResult } from '@reevio/types';
import { GenerateVideoInput, VideoProvider } from './video-provider.types';

export class GoogleFlowProvider implements VideoProvider {
  public readonly name = 'flow' as const;

  public constructor(private readonly apiKey: string | undefined) {}

  public async generateVideo(input: GenerateVideoInput): Promise<VideoGenerationResult> {
    if (!this.apiKey) {
      throw new Error('GOOGLE_FLOW_API_KEY is required for GoogleFlowProvider.');
    }

    const outputUrl = `storage://generated/videos/google-flow/${input.videoId}.mp4`;

    return {
      provider: this.name,
      url: outputUrl,
      previewUrl: outputUrl,
      durationInSeconds: input.builtScenes.reduce(
        (total, scene) => total + scene.durationInSeconds,
        0
      ),
    };
  }
}
