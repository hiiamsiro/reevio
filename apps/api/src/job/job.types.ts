import { JOB_STATUS_VALUES } from './job.constants';
import { VideoGenerationStep } from '@reevio/types';
import { VideoProviderName } from '../provider/provider.types';

export type JobStatus = (typeof JOB_STATUS_VALUES)[number];

export interface JobRecord {
  readonly id: string;
  readonly userId: string;
  readonly videoId: string;
  readonly provider: VideoProviderName;
  readonly status: JobStatus;
  readonly step: VideoGenerationStep;
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly resultUrl: string | null;
  readonly errorMessage: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateJobInput {
  readonly userId: string;
  readonly videoId: string;
  readonly prompt: string;
  readonly provider: VideoProviderName;
  readonly aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
}
