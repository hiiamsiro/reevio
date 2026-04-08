import { VIDEO_ASPECT_RATIO_VALUES, VIDEO_STATUS_VALUES } from './video.constants';
import { VideoProviderName } from '../provider/provider.types';

export type VideoStatus = (typeof VIDEO_STATUS_VALUES)[number];
export type VideoAspectRatio = (typeof VIDEO_ASPECT_RATIO_VALUES)[number];

export interface CreateVideoInput {
  readonly prompt: string;
  readonly provider: VideoProviderName;
  readonly aspectRatio: VideoAspectRatio;
}

export interface VideoRecord {
  readonly id: string;
  readonly prompt: string;
  readonly provider: VideoProviderName;
  readonly aspectRatio: VideoAspectRatio;
  readonly status: VideoStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}
