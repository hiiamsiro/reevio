import Redis from 'ioredis';

type VideoStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface VideoCompletedEvent {
  readonly event: 'video.completed' | 'video.failed';
  readonly videoId: string;
  readonly userId: string;
  readonly status: VideoStatus;
  readonly outputUrl: string | null;
  readonly previewUrl: string | null;
  readonly errorCode: string | null;
  readonly errorMessage: string | null;
}

const REDIS_CHANNEL = 'video:events';

export async function emitVideoCompletedEvent(
  redis: Redis,
  event: VideoCompletedEvent
): Promise<void> {
  await redis.publish(REDIS_CHANNEL, JSON.stringify(event));
}