import { JOB_STATUS_VALUES } from './job.constants';
import { VideoProviderName } from '../provider/provider.types';

export type JobStatus = (typeof JOB_STATUS_VALUES)[number];

export interface JobRecord {
  readonly id: string;
  readonly videoId: string;
  readonly provider: VideoProviderName;
  readonly status: JobStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateJobInput {
  readonly videoId: string;
  readonly provider: VideoProviderName;
}
