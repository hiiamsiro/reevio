import {
  toAppJobStep,
  toAppVideoProvider,
  toAppVideoStatus,
  toVideoAspectRatio,
} from '../database/prisma-value.mappers';
import { VideoRecord } from './video.types';

interface PersistedVideoRecord {
  readonly id: string;
  readonly userId: string;
  readonly prompt: string;
  readonly provider: string;
  readonly creditCost: number;
  readonly aspectRatio: string;
  readonly status: string;
  readonly title: string | null;
  readonly outputUrl: string | null;
  readonly previewUrl: string | null;
  readonly voiceoverUrl: string | null;
  readonly subtitlesUrl: string | null;
  readonly jobs?: readonly {
    readonly step: string;
  }[];
  readonly errorCode: string | null;
  readonly errorMessage: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function toVideoRecord(videoRecord: PersistedVideoRecord): VideoRecord {
  return {
    id: videoRecord.id,
    userId: videoRecord.userId,
    prompt: videoRecord.prompt,
    provider: toAppVideoProvider(videoRecord.provider),
    creditCost: videoRecord.creditCost,
    aspectRatio: toVideoAspectRatio(videoRecord.aspectRatio),
    status: toAppVideoStatus(videoRecord.status),
    title: videoRecord.title,
    outputUrl: videoRecord.outputUrl,
    previewUrl: videoRecord.previewUrl,
    voiceoverUrl: videoRecord.voiceoverUrl,
    subtitlesUrl: videoRecord.subtitlesUrl,
    currentStep: videoRecord.jobs?.[0] ? toAppJobStep(videoRecord.jobs[0].step) : null,
    errorCode: videoRecord.errorCode,
    errorMessage: videoRecord.errorMessage,
    createdAt: videoRecord.createdAt.toISOString(),
    updatedAt: videoRecord.updatedAt.toISOString(),
  };
}
