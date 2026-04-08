import { VideoGenerationResult } from '@reevio/types';
import { StorageService } from '../storage/storage.types';
import { GenerateVideoInput, VideoProvider } from './video-provider.types';

export class RemotionProvider implements VideoProvider {
  public readonly name = 'remotion' as const;

  public constructor(private readonly storageService: StorageService) {}

  public async generateVideo(input: GenerateVideoInput): Promise<VideoGenerationResult> {
    const outputUrl = await this.storageService.saveTextFile(
      `videos/remotion/${input.videoId}.mp4`,
      JSON.stringify(
        {
          provider: this.name,
          videoId: input.videoId,
          aspectRatio: input.aspectRatio,
          scenes: input.builtScenes.length,
          voiceoverUrl: input.voiceoverUrl,
          subtitlesUrl: input.subtitlesUrl,
        },
        null,
        2
      )
    );

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
