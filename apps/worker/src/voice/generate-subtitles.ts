import { StorageService } from '../storage/storage.types';

export async function generateSubtitles(
  videoId: string,
  subtitleLines: string[],
  storageService: StorageService
): Promise<string> {
  if (subtitleLines.length === 0) {
    throw new Error('Subtitle lines are required for subtitle generation.');
  }

  const subtitleContents = [
    'WEBVTT',
    '',
    ...subtitleLines.map((line, index) => `${index + 1}\n00:00:0${index}.000 --> 00:00:0${index + 1}.500\n${line}\n`),
  ].join('\n');

  return storageService.saveTextFile(`subtitles/${videoId}.vtt`, subtitleContents);
}
