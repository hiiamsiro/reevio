import {
  VideoAspectRatio,
  VideoGenerationStep,
} from '@reevio/types';
import { JobStatus } from '../job/job.types';
import { VideoProviderName } from '../provider/provider.types';
import { VideoStatus } from '../video/video.types';

type PrismaVideoProvider = 'REMOTION' | 'TOPVIEW' | 'GROK' | 'FLOW' | 'VEO';
type PrismaVideoStatus = 'DRAFT' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
type PrismaJobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
type PrismaJobStep =
  | 'PARSE_PROMPT'
  | 'AI_ORCHESTRATION'
  | 'GENERATE_IMAGES'
  | 'BUILD_SCENES'
  | 'GENERATE_VIDEO'
  | 'SAVE_RESULT';

const PRISMA_VIDEO_PROVIDER_BY_APP: Record<VideoProviderName, PrismaVideoProvider> = {
  remotion: 'REMOTION',
  topview: 'TOPVIEW',
  grok: 'GROK',
  flow: 'FLOW',
  veo: 'VEO',
};

const APP_VIDEO_PROVIDER_BY_PRISMA: Record<PrismaVideoProvider, VideoProviderName> = {
  REMOTION: 'remotion',
  TOPVIEW: 'topview',
  GROK: 'grok',
  FLOW: 'flow',
  VEO: 'veo',
};

const APP_VIDEO_STATUS_BY_PRISMA: Record<PrismaVideoStatus, VideoStatus> = {
  DRAFT: 'draft',
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

const APP_JOB_STATUS_BY_PRISMA: Record<PrismaJobStatus, JobStatus> = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

const APP_JOB_STEP_BY_PRISMA: Record<PrismaJobStep, VideoGenerationStep> = {
  PARSE_PROMPT: 'parsePrompt',
  AI_ORCHESTRATION: 'aiOrchestration',
  GENERATE_IMAGES: 'generateImages',
  BUILD_SCENES: 'buildScenes',
  GENERATE_VIDEO: 'generateVideo',
  SAVE_RESULT: 'saveResult',
};

export function toPrismaVideoProvider(providerName: VideoProviderName): PrismaVideoProvider {
  return PRISMA_VIDEO_PROVIDER_BY_APP[providerName];
}

export function toAppVideoProvider(providerName: string): VideoProviderName {
  const mappedProvider = APP_VIDEO_PROVIDER_BY_PRISMA[providerName as PrismaVideoProvider];

  if (!mappedProvider) {
    throw new Error(`Unsupported persisted provider "${providerName}".`);
  }

  return mappedProvider;
}

export function toAppVideoStatus(status: string): VideoStatus {
  const mappedStatus = APP_VIDEO_STATUS_BY_PRISMA[status as PrismaVideoStatus];

  if (!mappedStatus) {
    throw new Error(`Unsupported persisted video status "${status}".`);
  }

  return mappedStatus;
}

export function toAppJobStatus(status: string): JobStatus {
  const mappedStatus = APP_JOB_STATUS_BY_PRISMA[status as PrismaJobStatus];

  if (!mappedStatus) {
    throw new Error(`Unsupported persisted job status "${status}".`);
  }

  return mappedStatus;
}

export function toAppJobStep(step: string): VideoGenerationStep {
  const mappedStep = APP_JOB_STEP_BY_PRISMA[step as PrismaJobStep];

  if (!mappedStep) {
    throw new Error(`Unsupported persisted job step "${step}".`);
  }

  return mappedStep;
}

export function toVideoAspectRatio(aspectRatio: string): VideoAspectRatio {
  if (
    aspectRatio !== '16:9' &&
    aspectRatio !== '9:16' &&
    aspectRatio !== '1:1' &&
    aspectRatio !== '4:5'
  ) {
    throw new Error(`Unsupported aspect ratio "${aspectRatio}".`);
  }

  return aspectRatio;
}
