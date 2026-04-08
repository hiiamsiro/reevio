export function generateSubtitles(videoId: string, subtitleLines: string[]): string {
  if (subtitleLines.length === 0) {
    throw new Error('Subtitle lines are required for subtitle generation.');
  }

  return `storage://generated/subtitles/${videoId}.vtt`;
}
