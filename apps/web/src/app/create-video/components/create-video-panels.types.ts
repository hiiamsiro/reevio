import type { ChangeEvent } from 'react';
import type {
  CtaType,
  ExportFormatDefinition,
  HashtagSuggestionSet,
  HookOption,
  PostingPreparation,
  TrendIdea,
  VideoTemplateDefinition,
} from '../content-studio';
import type { BulkJobItem, PerformanceInsight, TeamMember, WatermarkPosition } from '../page.types';

export interface HookGeneratorPanelProps {
  readonly hookSource: string;
  readonly onHookSourceChange: (value: string) => void;
  readonly onGenerateHooks: () => void;
  readonly selectedHook: HookOption | null;
  readonly hookOptions: readonly HookOption[];
  readonly selectedHookId: string | null;
  readonly copiedHookId: string | null;
  readonly onCopyHook: (hook: HookOption) => void;
  readonly onSelectHook: (hookId: string) => void;
  readonly errorMessage: string | null;
}

export interface CtaEnginePanelProps {
  readonly ctaType: CtaType;
  readonly onSelectCtaType: (type: CtaType) => void;
  readonly onRegenerateCta: () => void;
  readonly ctaText: string;
  readonly onCtaTextChange: (value: string) => void;
}

export interface BulkGenerationPanelProps {
  readonly bulkInput: string;
  readonly onBulkInputChange: (value: string) => void;
  readonly onBulkFileUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  readonly onGenerateBulk: () => Promise<void>;
  readonly isBulkGenerating: boolean;
  readonly onRetryFailedBulkJobs: () => void;
  readonly bulkJobs: readonly BulkJobItem[];
  readonly onRetryBulkJob: (bulkJobId: string) => Promise<void>;
  readonly errorMessage: string | null;
}

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
  readonly onUpdatePostingPreparation: (field: keyof PostingPreparation, value: string) => void;
  readonly postingNotice: string | null;
}

export interface HashtagGeneratorPanelProps {
  readonly hashtagSuggestions: HashtagSuggestionSet;
  readonly onRegenerateHashtags: () => void;
  readonly onCopyHashtags: () => void;
  readonly onUseHashtagsInPosting: () => void;
  readonly hashtagNotice: string | null;
}

export interface TrendIdeasPanelProps {
  readonly trendIdeas: readonly TrendIdea[];
}

export interface TemplateGalleryPanelProps {
  readonly videoTemplates: readonly VideoTemplateDefinition[];
  readonly onApplyTemplate: (templatePrompt: string) => void;
}

export interface TeamModePanelProps {
  readonly inviteEmail: string;
  readonly onInviteEmailChange: (value: string) => void;
  readonly inviteRole: TeamMember['role'];
  readonly onInviteRoleChange: (role: TeamMember['role']) => void;
  readonly onInviteMember: () => void;
  readonly teamMembers: readonly TeamMember[];
  readonly teamNotice: string | null;
}

export interface WatermarkPanelProps {
  readonly watermarkType: 'text' | 'logo';
  readonly onWatermarkTypeChange: (type: 'text' | 'logo') => void;
  readonly watermarkText: string;
  readonly onWatermarkTextChange: (value: string) => void;
  readonly watermarkPosition: WatermarkPosition;
  readonly onWatermarkPositionChange: (position: WatermarkPosition) => void;
}

export interface PerformanceAiPanelProps {
  readonly performanceInsight: PerformanceInsight;
  readonly views: string;
  readonly onViewsChange: (value: string) => void;
  readonly likes: string;
  readonly onLikesChange: (value: string) => void;
  readonly watchTime: string;
  readonly onWatchTimeChange: (value: string) => void;
}
