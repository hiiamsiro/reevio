import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { JobService } from '../job/job.service';
import { ProviderService } from '../provider/provider.service';
import { CreateVideoInput, VideoRecord } from './video.types';
import { VideoNotFoundError } from './video.errors';

@Injectable()
export class VideoService {
  private readonly videos = new Map<string, VideoRecord>();

  public constructor(
    private readonly providerService: ProviderService,
    private readonly jobService: JobService
  ) {}

  public createVideo(input: CreateVideoInput): VideoRecord {
    this.providerService.getProvider(input.provider);

    const timestamp = new Date().toISOString();
    const videoRecord: VideoRecord = {
      id: randomUUID(),
      prompt: input.prompt,
      provider: input.provider,
      aspectRatio: input.aspectRatio,
      status: 'queued',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.videos.set(videoRecord.id, videoRecord);

    this.jobService.createJob({
      provider: videoRecord.provider,
      videoId: videoRecord.id,
    });

    return videoRecord;
  }

  public getVideo(videoId: string): VideoRecord {
    const videoRecord = this.videos.get(videoId);

    if (!videoRecord) {
      throw new VideoNotFoundError(videoId);
    }

    return videoRecord;
  }

  public listVideos(): VideoRecord[] {
    return [...this.videos.values()];
  }
}
