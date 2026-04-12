import { VideoGenerationResult } from '@reevio/types';
import { StorageService } from '../storage/storage.types';
import { GenerateVideoInput, VideoProvider } from './video-provider.types';

export class GoogleFlowProvider implements VideoProvider {
  public readonly name = 'flow' as const;

  public constructor(
    private readonly apiKey: string | undefined,
    private readonly storageService: StorageService
  ) {}

  public async generateVideo(input: GenerateVideoInput): Promise<VideoGenerationResult> {
    if (!this.apiKey) {
      throw new Error('GOOGLE_FLOW_API_KEY is required for GoogleFlowProvider.');
    }

    const outputUrl = await this.storageService.saveTextFile(
      `videos/google-flow/${input.videoId}.mp4`,
      JSON.stringify(
        {
          provider: this.name,
          videoId: input.videoId,
          scenes: input.builtScenes.map((scene) => scene.id),
        },
        null,
        2
      )
    );

    return {
      provider: this.name,
      url: outputUrl,
      previewUrl: outputUrl,
      durationInSeconds: input.builtScenes.reduce(
        (total, scene) => total + scene.durationInSeconds,
        0
      ),
      artifactKind: 'json',
    };
  }
}
