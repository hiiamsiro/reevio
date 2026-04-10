import type { Dispatch, SetStateAction } from 'react';
import type { User } from '@reevio/types';
import type { ExportFormatDefinition } from './content-studio';

export interface VideoResponse {
  readonly id: string;
  readonly prompt: string;
  readonly provider: string;
  readonly aspectRatio: string;
  readonly status: string;
  readonly title: string | null;
  readonly outputUrl: string | null;
  readonly previewUrl: string | null;
  readonly errorCode: string | null;
  readonly errorMessage: string | null;
  readonly voiceoverUrl?: string | null;
  readonly subtitlesUrl?: string | null;
}

export interface ProviderDefinition {
  readonly name: string;
  readonly label: string;
  readonly description: string;
  readonly status: 'available' | 'beta' | 'disabled';
  readonly priceTier: 'free' | 'pro' | 'premium';
  readonly creditCost: number;
}

export type CurrentUser = Pick<User, 'id' | 'email' | 'plan' | 'credits'>;

export interface GenerateVideoResponse {
  readonly video: VideoResponse;
  readonly remainingCredits: number;
  readonly creditsCharged: boolean;
}

export type BulkJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface BulkJobItem {
  readonly id: string;
  readonly productDescription: string;
  readonly videoId: string | null;
  readonly status: BulkJobStatus;
  readonly outputUrl: string | null;
  readonly errorMessage: string | null;
}

export interface TeamMember {
  readonly id: string;
  readonly email: string;
  readonly role: 'owner' | 'editor';
}

export type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface PerformanceInsight {
  readonly health: string;
  readonly suggestion: string;
}

export interface AppRouter {
  readonly push: (href: string) => void;
  readonly refresh: () => void;
}

export interface GenerateVideoRequestInput {
  readonly prompt: string;
  readonly provider: string;
  readonly aspectRatio: string;
  readonly router: AppRouter;
  readonly fallbackError: string;
}

export interface SubmitVideoRequestInput {
  readonly promptToSend: string;
  readonly router: AppRouter;
  readonly provider: string;
  readonly aspectRatio: string;
  readonly setVideo: Dispatch<SetStateAction<VideoResponse | null>>;
  readonly setCurrentUser: Dispatch<SetStateAction<CurrentUser | null>>;
  readonly setErrorMessage: Dispatch<SetStateAction<string | null>>;
}

export interface FetchResourceInput {
  readonly path: string;
  readonly router: AppRouter;
  readonly fallbackError: string;
}

export interface CreateExportBriefInput {
  readonly format: ExportFormatDefinition;
  readonly prompt: string;
  readonly selectedHookText: string | null;
  readonly ctaText: string | null;
}

export interface DownloadTextFileInput {
  readonly content: string;
  readonly fileName: string;
}

export interface CreatePerformanceInsightInput {
  readonly views: string;
  readonly likes: string;
  readonly watchTime: string;
}
