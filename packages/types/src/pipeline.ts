import type { VideoProvider } from './index';

export const VIDEO_GENERATION_QUEUE_NAME = 'video-generation';

export const VIDEO_GENERATION_STEP_VALUES = [
  'parsePrompt',
  'aiOrchestration',
  'generateImages',
  'buildScenes',
  'generateVideo',
  'saveResult',
] as const;

export const VIDEO_ASPECT_RATIO_VALUES = ['16:9', '9:16', '1:1', '4:5'] as const;

export type VideoGenerationStep = (typeof VIDEO_GENERATION_STEP_VALUES)[number];
export type VideoAspectRatio = (typeof VIDEO_ASPECT_RATIO_VALUES)[number];

export interface VideoGenerationJobData {
  readonly jobId: string;
  readonly videoId: string;
  readonly userId: string;
  readonly prompt: string;
  readonly provider: VideoProvider;
  readonly aspectRatio: VideoAspectRatio;
}

export interface ParsedPromptData {
  readonly rawPrompt: string;
  readonly productName: string;
  readonly audience: string;
  readonly primaryGoal: string;
  readonly highlights: string[];
}

export interface ScriptBeat {
  readonly id: string;
  readonly narration: string;
  readonly visualDirection: string;
}

export interface SceneOutline {
  readonly id: string;
  readonly headline: string;
  readonly narration: string;
  readonly visualPrompt: string;
  readonly durationInSeconds: number;
}

export interface OrchestratedVideoPlan {
  readonly title: string;
  readonly tagline: string;
  readonly script: string;
  readonly beats: ScriptBeat[];
  readonly scenes: SceneOutline[];
  readonly imagePrompts: string[];
  readonly voiceoverText: string;
  readonly subtitleLines: string[];
  readonly durationInSeconds: number;
}

export interface GeneratedImageAsset {
  readonly id: string;
  readonly prompt: string;
  readonly url: string;
  readonly score: number;
}

export interface GeneratedImageVariation {
  readonly id: string;
  readonly prompt: string;
  readonly sourcePromptId: string;
  readonly url: string;
  readonly score: number;
}

export interface ValidatedImageVariation extends GeneratedImageVariation {
  readonly isValid: boolean;
  readonly validationIssues: string[];
}

export interface RankedImageVariation extends ValidatedImageVariation {
  readonly rank: number;
}

export interface BuiltScene {
  readonly id: string;
  readonly headline: string;
  readonly narration: string;
  readonly visualPrompt: string;
  readonly assetUrl: string;
  readonly durationInSeconds: number;
}

export interface VideoGenerationResult {
  readonly provider: VideoProvider;
  readonly url: string;
  readonly previewUrl: string;
  readonly durationInSeconds: number;
}
