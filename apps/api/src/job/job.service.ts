import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { Env } from '@reevio/config';
import { VideoGenerationJobData, VIDEO_GENERATION_QUEUE_NAME } from '@reevio/types';
import { PrismaService } from '../prisma/prisma.service';
import {
  toAppJobStatus,
  toAppJobStep,
  toPrismaVideoProvider,
} from '../database/prisma-value.mappers';
import { JOB_BACKOFF_DELAY_MS, JOB_MAX_ATTEMPTS } from './job.constants';
import { JobQueueError } from './job.errors';
import { CreateJobInput, JobRecord } from './job.types';

interface PersistedJobRecord {
  readonly id: string;
  readonly userId: string;
  readonly videoId: string;
  readonly provider: string;
  readonly status: string;
  readonly step: string;
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly resultUrl: string | null;
  readonly errorMessage: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

@Injectable()
export class JobService implements OnModuleDestroy {
  private readonly queue: Queue<VideoGenerationJobData>;

  public constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService<Env, true>
  ) {
    const redisUrl = this.configService.getOrThrow('REDIS_URL', { infer: true });

    this.queue = new Queue<VideoGenerationJobData>(VIDEO_GENERATION_QUEUE_NAME, {
      connection: {
        url: redisUrl,
      },
    });
  }

  public async createJob(input: CreateJobInput): Promise<JobRecord> {
    const jobRecord = await this.prismaService.job.create({
      data: {
        userId: input.userId,
        videoId: input.videoId,
        provider: toPrismaVideoProvider(input.provider),
      },
    });

    const queueJobData: VideoGenerationJobData = {
      jobId: jobRecord.id,
      videoId: input.videoId,
      userId: input.userId,
      prompt: input.prompt,
      provider: input.provider,
      aspectRatio: input.aspectRatio,
    };

    try {
      await this.queue.add(VIDEO_GENERATION_QUEUE_NAME, queueJobData, {
        jobId: jobRecord.id,
        attempts: JOB_MAX_ATTEMPTS,
        backoff: {
          type: 'exponential',
          delay: JOB_BACKOFF_DELAY_MS,
        },
        removeOnComplete: 100,
        removeOnFail: 100,
      });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);

      await this.prismaService.job.update({
        where: {
          id: jobRecord.id,
        },
        data: {
          status: 'FAILED',
          errorCode: 'QUEUE_ENQUEUE_FAILED',
          errorMessage,
        },
      });

      throw new JobQueueError(jobRecord.id, input.videoId, errorMessage);
    }

    return toJobRecord({
      ...jobRecord,
      attempts: jobRecord.attempts,
      maxAttempts: jobRecord.maxAttempts,
      resultUrl: jobRecord.resultUrl,
      errorMessage: jobRecord.errorMessage,
    });
  }

  public async getJob(jobId: string): Promise<JobRecord | null> {
    const jobRecord = await this.prismaService.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!jobRecord) {
      return null;
    }

    return toJobRecord(jobRecord);
  }

  public async listJobs(): Promise<JobRecord[]> {
    const jobRecords = await this.prismaService.job.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return jobRecords.map(toJobRecord);
  }

  public async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}

function toJobRecord(jobRecord: PersistedJobRecord): JobRecord {
  return {
    id: jobRecord.id,
    userId: jobRecord.userId,
    videoId: jobRecord.videoId,
    provider: toAppProviderName(jobRecord.provider),
    status: toAppJobStatus(jobRecord.status),
    step: toAppJobStep(jobRecord.step),
    attempts: jobRecord.attempts,
    maxAttempts: jobRecord.maxAttempts,
    resultUrl: jobRecord.resultUrl,
    errorMessage: jobRecord.errorMessage,
    createdAt: jobRecord.createdAt.toISOString(),
    updatedAt: jobRecord.updatedAt.toISOString(),
  };
}

function toAppProviderName(providerName: string): 'remotion' {
  switch (providerName) {
    case 'REMOTION':
      return 'remotion';
    default:
      throw new Error(`Unknown provider value "${providerName}".`);
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown queue error';
}
