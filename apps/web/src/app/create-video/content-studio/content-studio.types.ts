export type ExportFormatId =
  | 'tiktok-9x16'
  | 'reels-9x16'
  | 'shorts-9x16'
  | 'square-1x1'
  | 'portrait-4x5';

export interface ExportFormatInput {
  readonly prompt: string;
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
}

export interface PostingPreparationInput {
  readonly prompt: string;
}

export interface PostingPreparation {
  readonly title: string;
  readonly caption: string;
  readonly hashtags: string;
}

export interface RewriteVariationInput {
  readonly prompt: string;
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
}
