export class JobQueueError extends Error {
  public readonly code: string;

  public constructor(jobId: string, videoId: string, reason: string) {
    super(`Failed to enqueue job "${jobId}" for video "${videoId}". Reason: ${reason}`);
    this.name = 'JobQueueError';
    this.code = 'JOB_QUEUE_ERROR';
  }
}
