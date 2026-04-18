import type { BuiltScene, VideoAspectRatio } from '@reevio/types';

export interface SubtitleCue {
  readonly endMs: number;
  readonly startMs: number;
  readonly text: string;
}

export interface RemotionVideoProps extends Record<string, unknown> {
  readonly aspectRatio: VideoAspectRatio;
  readonly builtScenes: BuiltScene[];
  readonly durationInSeconds: number;
  readonly subtitleCues: SubtitleCue[];
  readonly voiceoverUrl: string;
}
