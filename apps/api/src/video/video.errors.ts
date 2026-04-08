export class VideoNotFoundError extends Error {
  public readonly code: string;

  public constructor(videoId: string) {
    super(`Video "${videoId}" was not found.`);
    this.name = 'VideoNotFoundError';
    this.code = 'VIDEO_NOT_FOUND';
  }
}
