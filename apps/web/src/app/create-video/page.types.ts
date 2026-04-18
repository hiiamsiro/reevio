import type { Dispatch, SetStateAction } from 'react';
import type { User, VideoGenerationStep } from '@reevio/types';
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
  readonly currentStep?: VideoGenerationStep | null;
  readonly createdAt?: string;
  readonly updatedAt?: string;
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
}

export interface DownloadTextFileInput {
  readonly content: string;
  readonly fileName: string;
}
