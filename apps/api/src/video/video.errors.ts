export class VideoNotFoundError extends Error {
  public readonly code: string;

  public constructor(videoId: string) {
    super(`Video "${videoId}" was not found.`);
    this.name = 'VideoNotFoundError';
    this.code = 'VIDEO_NOT_FOUND';
  }
}

export class VideoQueueError extends Error {
  public readonly code: string;

  public constructor(videoId: string, reason: string) {
    super(`Failed to start generation for video "${videoId}". Reason: ${reason}`);
    this.name = 'VideoQueueError';
    this.code = 'VIDEO_QUEUE_ERROR';
  }
}
