import type {
  ExportFormatDefinition,
  PostingPreparation,
  TrendIdea,
  VideoTemplateDefinition,
} from '../content-studio';

export interface ExportPanelProps {
  readonly exportFormats: readonly ExportFormatDefinition[];
  readonly selectedExportFormat: ExportFormatDefinition;
  readonly onSelectExportFormat: (formatId: ExportFormatDefinition['id']) => void;
  readonly onDownloadAllFormats: () => void;
  readonly onDownloadFormat: (format: ExportFormatDefinition) => void;
}

export interface PostingPreparationPanelProps {
  readonly postingPreparation: PostingPreparation;
  readonly onRegeneratePostingPreparation: () => void;
  readonly onCopyPostingField: (label: string, value: string) => void;
  readonly onUpdatePostingPreparation: (
    field: keyof PostingPreparation,
    value: string
  ) => void;
  readonly postingNotice: string | null;
}

export interface TrendIdeasPanelProps {
  readonly trendIdeas: readonly TrendIdea[];
}

export interface TemplateGalleryPanelProps {
  readonly videoTemplates: readonly VideoTemplateDefinition[];
  readonly onApplyTemplate: (templatePrompt: string) => void;
}
