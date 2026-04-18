import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toPrismaVideoProvider } from '../database/prisma-value.mappers';
import { JobService } from '../job/job.service';
import { ProviderService } from '../provider/provider.service';
import { CreateVideoInput, VideoCreationResult, VideoRecord } from './video.types';
import { InsufficientCreditsError, VideoNotFoundError } from './video.errors';
import { toVideoRecord } from './video.mappers';
import { VideoQueueError } from './video.errors';

@Injectable()
export class VideoService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly providerService: ProviderService,
    private readonly jobService: JobService
  ) {}

  public async createVideo(input: CreateVideoInput): Promise<VideoCreationResult> {
    const providerDefinition = this.providerService.getCreatableProvider(input.provider);
    return this.createFreshVideo(input, providerDefinition.creditCost);
  }

  private async createFreshVideo(
    input: CreateVideoInput,
    creditCost: number
  ): Promise<VideoCreationResult> {

    const { remainingCredits, videoRecord } = await this.prismaService.$transaction(
      async (transactionClient) => {
        const existingUser = await transactionClient.user.findUnique({
          where: {
            id: input.userId,
          },
          select: {
            credits: true,
          },
        });

        if (!existingUser) {
          throw new Error(`User "${input.userId}" was not found while creating a video.`);
        }

        const creditReservation = await transactionClient.user.updateMany({
          where: {
            id: input.userId,
            credits: {
              gte: creditCost,
            },
          },
          data: {
            credits: {
              decrement: creditCost,
            },
          },
        });

        if (creditReservation.count === 0) {
          const currentUser = await transactionClient.user.findUnique({
            where: {
              id: input.userId,
            },
            select: {
              credits: true,
            },
          });

          throw new InsufficientCreditsError(currentUser?.credits ?? 0, creditCost);
        }

        const reservedVideoRecord = await transactionClient.video.create({
          data: {
            userId: input.userId,
            prompt: input.prompt,
            provider: toPrismaVideoProvider(input.provider),
            status: 'QUEUED',
            creditCost,
            creditChargedAt: new Date(),
            aspectRatio: input.aspectRatio,
          },
        });

        return {
          remainingCredits: existingUser.credits - creditCost,
          videoRecord: reservedVideoRecord,
        };
      }
    );

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

      await this.refundVideoCredits(videoRecord.id, input.userId, 'JOB_CREATION_FAILED', errorMessage);

      throw new VideoQueueError(videoRecord.id, errorMessage);
    }

    return {
      video: await this.getVideo(videoRecord.id, input.userId),
      remainingCredits,
      creditsCharged: true,
    };
  }

  public async getVideo(videoId: string, userId: string): Promise<VideoRecord> {
    const videoRecord = await this.prismaService.video.findFirst({
      where: {
        id: videoId,
        userId,
      },
      include: latestJobInclude,
    });

    if (!videoRecord) {
      throw new VideoNotFoundError(videoId);
    }

    return toVideoRecord(videoRecord);
  }

  public async listVideos(userId: string): Promise<VideoRecord[]> {
    const videoRecords = await this.prismaService.video.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: latestJobInclude,
    });

    return videoRecords.map(toVideoRecord);
  }

  private async refundVideoCredits(
    videoId: string,
    userId: string,
    errorCode: string,
    errorMessage: string
  ): Promise<void> {
    await this.prismaService.$transaction(async (transactionClient) => {
      const videoRecord = await transactionClient.video.findUnique({
        where: {
          id: videoId,
        },
        select: {
          creditCost: true,
          creditRefundedAt: true,
        },
      });

      if (!videoRecord) {
        throw new Error(`Video "${videoId}" was not found while refunding credits.`);
      }

      if (!videoRecord.creditRefundedAt && videoRecord.creditCost > 0) {
        await transactionClient.user.update({
          where: {
            id: userId,
          },
          data: {
            credits: {
              increment: videoRecord.creditCost,
            },
          },
        });
      }

      await transactionClient.video.update({
        where: {
          id: videoId,
        },
        data: {
          status: 'FAILED',
          errorCode,
          errorMessage,
          creditRefundedAt: videoRecord.creditRefundedAt ?? new Date(),
        },
      });
    });
  }
}

const latestJobInclude = {
  jobs: {
    orderBy: {
      createdAt: 'desc' as const,
    },
    take: 1,
    select: {
      step: true,
    },
  },
} as const;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown video queue error';
}
