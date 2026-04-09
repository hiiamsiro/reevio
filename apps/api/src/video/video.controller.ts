import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../auth/auth.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { InsufficientCreditsError, VideoNotFoundError } from './video.errors';
import { generateVideoRequestSchema, videoIdParamSchema } from './video.schemas';
import { VideoService } from './video.service';

@Controller()
export class VideoController {
  public constructor(private readonly videoService: VideoService) {}

  @Post('generate-video')
  public async generateVideo(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown
  ) {
    const parsedBody = generateVideoRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      throw new BadRequestException(parsedBody.error.flatten());
    }

    try {
      const video = await this.videoService.createVideo({
        userId: user.id,
        prompt: parsedBody.data.prompt,
        provider: parsedBody.data.provider,
        aspectRatio: parsedBody.data.aspectRatio,
      });

      return {
        success: true,
        data: video,
        error: null,
      };
    } catch (error: unknown) {
      if (error instanceof InsufficientCreditsError) {
        throw new HttpException(error.message, HttpStatus.PAYMENT_REQUIRED);
      }

      throw error;
    }
  }

  @Get('video/:id')
  public async getVideo(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: unknown
  ) {
    const parsedParams = videoIdParamSchema.safeParse(params);

    if (!parsedParams.success) {
      throw new BadRequestException(parsedParams.error.flatten());
    }

    try {
      const video = await this.videoService.getVideo(parsedParams.data.id, user.id);

      return {
        success: true,
        data: video,
        error: null,
      };
    } catch (error: unknown) {
      if (error instanceof VideoNotFoundError) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}
