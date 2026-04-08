import { ParsedPromptData, SceneOutline, ScriptBeat, VideoGenerationJobData } from '@reevio/types';

export interface GeneratedScriptPlan {
  readonly title: string;
  readonly tagline: string;
  readonly script: string;
  readonly beats: ScriptBeat[];
  readonly voiceoverText: string;
  readonly subtitleLines: string[];
}

export interface SceneGenerationInput {
  readonly extractedData: ParsedPromptData;
  readonly scriptPlan: GeneratedScriptPlan;
  readonly jobData: VideoGenerationJobData;
}
