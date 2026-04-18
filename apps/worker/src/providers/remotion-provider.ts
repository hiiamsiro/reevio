import { VideoGenerationResult } from '@reevio/types';
import { StorageService } from '../storage/storage.types';
import { renderRemotionVideo } from './remotion-helpers';
import { GenerateVideoInput, VideoProvider } from './video-provider.types';

export class RemotionProvider implements VideoProvider {
  public readonly name = 'remotion' as const;

  public constructor(private readonly storageService: StorageService) {}

  public async generateVideo(input: GenerateVideoInput): Promise<VideoGenerationResult> {
    const renderedVideo = await renderRemotionVideo({
      aspectRatio: input.aspectRatio,
      builtScenes: input.builtScenes,
      subtitlesUrl: input.subtitlesUrl,
      videoId: input.videoId,
      voiceoverUrl: input.voiceoverUrl,
    });
    const outputUrl = await this.storageService.saveBinaryFile(
      `videos/remotion/${input.videoId}.mp4`,
      renderedVideo.fileBytes
    );

    return {
      provider: this.name,
      url: outputUrl,
      previewUrl: outputUrl,
      durationInSeconds: renderedVideo.durationInSeconds,
      artifactKind: 'video',
    };
  }
}
