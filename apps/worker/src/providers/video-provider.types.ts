import { BuiltScene, OrchestratedVideoPlan, VideoAspectRatio, VideoGenerationResult } from '@reevio/types';

export interface GenerateVideoInput {
  readonly videoId: string;
  readonly aspectRatio: VideoAspectRatio;
  readonly orchestratedPlan: OrchestratedVideoPlan;
  readonly builtScenes: BuiltScene[];
  readonly voiceoverUrl: string;
  readonly subtitlesUrl: string;
}

export interface VideoProvider {
  readonly name: 'remotion' | 'topview' | 'grok' | 'flow' | 'veo' | 'gemini';
  generateVideo(input: GenerateVideoInput): Promise<VideoGenerationResult>;
}
