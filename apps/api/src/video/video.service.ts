import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toPrismaVideoProvider } from '../database/prisma-value.mappers';
import { JobService } from '../job/job.service';
import { ProviderService } from '../provider/provider.service';
import { CreateVideoInput, VideoRecord } from './video.types';
import { VideoNotFoundError } from './video.errors';
import { toVideoRecord } from './video.mappers';
import { VideoQueueError } from './video.errors';

@Injectable()
export class VideoService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly providerService: ProviderService,
    private readonly jobService: JobService
  ) {}

  public async createVideo(input: CreateVideoInput): Promise<VideoRecord> {
    this.providerService.getProvider(input.provider);

    const videoRecord = await this.prismaService.video.create({
      data: {
        userId: input.userId,
        prompt: input.prompt,
        provider: toPrismaVideoProvider(input.provider),
        status: 'QUEUED',
        aspectRatio: input.aspectRatio,
      },
    });

    try {
      await this.jobService.createJob({
        userId: input.userId,
        videoId: videoRecord.id,
        prompt: input.prompt,
        provider: input.provider,
        aspectRatio: input.aspectRatio,
      });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);

      await this.prismaService.video.update({
        where: {
          id: videoRecord.id,
        },
        data: {
          status: 'FAILED',
          errorCode: 'JOB_CREATION_FAILED',
          errorMessage,
        },
      });

      throw new VideoQueueError(videoRecord.id, errorMessage);
    }

    return this.getVideo(videoRecord.id);
  }

  public async getVideo(videoId: string): Promise<VideoRecord> {
    const videoRecord = await this.prismaService.video.findUnique({
      where: {
        id: videoId,
      },
    });

    if (!videoRecord) {
      throw new VideoNotFoundError(videoId);
    }

    return toVideoRecord(videoRecord);
  }

  public async listVideos(): Promise<VideoRecord[]> {
    const videoRecords = await this.prismaService.video.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return videoRecords.map(toVideoRecord);
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown video queue error';
}
