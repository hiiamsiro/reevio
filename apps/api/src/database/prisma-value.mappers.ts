import { UserPlan, UserRole, VideoAspectRatio, VideoGenerationStep } from '@reevio/types';
import { JobStatus } from '../job/job.types';
import { VideoProviderName } from '../provider/provider.types';
import { VideoStatus } from '../video/video.types';

type PrismaVideoProvider = 'REMOTION';
type PrismaVideoStatus = 'DRAFT' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
type PrismaJobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
type PrismaJobStep =
  | 'PARSE_PROMPT'
  | 'AI_ORCHESTRATION'
  | 'GENERATE_IMAGES'
  | 'BUILD_SCENES'
  | 'GENERATE_VIDEO'
  | 'SAVE_RESULT';
type PrismaUserPlan = 'FREE' | 'PRO' | 'PREMIUM';
type PrismaUserRole = 'MEMBER' | 'ADMIN';

const PRISMA_VIDEO_PROVIDER_BY_APP: Record<VideoProviderName, PrismaVideoProvider> = {
  remotion: 'REMOTION',
};

const APP_VIDEO_PROVIDER_BY_PRISMA: Record<PrismaVideoProvider, VideoProviderName> = {
  REMOTION: 'remotion',
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

const APP_USER_PLAN_BY_PRISMA: Record<PrismaUserPlan, UserPlan> = {
  FREE: 'free',
  PRO: 'pro',
  PREMIUM: 'premium',
};

const APP_USER_ROLE_BY_PRISMA: Record<PrismaUserRole, UserRole> = {
  MEMBER: 'member',
  ADMIN: 'admin',
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

export function toAppUserPlan(plan: string): UserPlan {
  const mappedPlan = APP_USER_PLAN_BY_PRISMA[plan as PrismaUserPlan];

  if (!mappedPlan) {
    throw new Error(`Unsupported persisted user plan "${plan}".`);
  }

  return mappedPlan;
}

export function toAppUserRole(role: string): UserRole {
  const mappedRole = APP_USER_ROLE_BY_PRISMA[role as PrismaUserRole];

  if (!mappedRole) {
    throw new Error(`Unsupported persisted user role "${role}".`);
  }

  return mappedRole;
}
