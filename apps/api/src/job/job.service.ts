import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateJobInput, JobRecord } from './job.types';

@Injectable()
export class JobService {
  private readonly jobs = new Map<string, JobRecord>();

  public createJob(input: CreateJobInput): JobRecord {
    const timestamp = new Date().toISOString();
    const jobRecord: JobRecord = {
      id: randomUUID(),
      videoId: input.videoId,
      provider: input.provider,
      status: 'queued',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.jobs.set(jobRecord.id, jobRecord);

    return jobRecord;
  }

  public getJob(jobId: string): JobRecord | null {
    return this.jobs.get(jobId) ?? null;
  }

  public listJobs(): JobRecord[] {
    return [...this.jobs.values()];
  }
}
