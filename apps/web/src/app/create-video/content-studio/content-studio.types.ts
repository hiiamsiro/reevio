export interface HookGeneratorInput {
  readonly productDescription: string;
  readonly seed: number;
}

export type CtaType = 'urgency' | 'scarcity' | 'discount';
export type ExportFormatId = 'tiktok-9x16' | 'instagram-1x1' | 'instagram-4x5';

export interface HookOption {
  readonly id: string;
  readonly text: string;
  readonly angle: string;
}

export interface CtaGeneratorInput {
  readonly productDescription: string;
  readonly seed: number;
  readonly type: CtaType;
}

export interface ExportFormatInput {
  readonly prompt: string;
  readonly selectedHookText: string | null;
  readonly ctaText: string | null;
}

export interface ExportFormatDefinition {
  readonly id: ExportFormatId;
  readonly platform: string;
  readonly label: string;
  readonly aspectRatio: '9:16' | '1:1' | '4:5';
  readonly canvas: string;
  readonly layoutLabel: string;
  readonly previewHeadline: string;
  readonly previewBody: string;
  readonly ctaLabel: string;
}

export interface PostingPreparationInput {
  readonly prompt: string;
  readonly selectedHookText: string | null;
  readonly ctaText: string | null;
}

export interface PostingPreparation {
  readonly title: string;
  readonly caption: string;
  readonly hashtags: string;
}

export interface HashtagSuggestionInput {
  readonly prompt: string;
  readonly seed: number;
}

export interface HashtagSuggestionSet {
  readonly trending: string[];
  readonly niche: string[];
  readonly combined: string;
}

export interface ViralScoreAnalysisInput {
  readonly prompt: string;
  readonly selectedHookText: string | null;
  readonly ctaText: string | null;
}

export interface ViralScoreAnalysis {
  readonly score: number;
  readonly hook: number;
  readonly emotion: number;
  readonly length: number;
}

export interface RewriteVariationInput {
  readonly prompt: string;
  readonly selectedHookText: string | null;
  readonly ctaText: string | null;
}

export interface TrendIdea {
  readonly topic: string;
  readonly idea: string;
}

export interface VideoTemplateDefinition {
  readonly id: string;
  readonly name: string;
  readonly preview: string;
  readonly prompt: string;
}

export interface PromptWithCreativeDirectivesInput {
  readonly prompt: string;
  readonly selectedHookText: string | null;
  readonly ctaText: string | null;
}
