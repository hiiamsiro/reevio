import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { StorageService } from '../storage/storage.types';
import { getAudioDurationInSeconds } from './get-audio-duration';
import { resolveLocalStoragePath } from '../storage/resolve-local-storage-path';

interface EdgeSubtitlePart {
  readonly part: string;
  readonly start: number;
  readonly end: number;
}

export async function generateSubtitles(
  videoId: string,
  subtitleLines: string[],
  storageService: StorageService,
  voiceoverUrl?: string
): Promise<string> {
  if (subtitleLines.length === 0) {
    throw new Error('Subtitle lines are required for subtitle generation.');
  }

  const subtitleContents =
    (await createVttFromTimingSidecar(videoId)) ??
    (await createFallbackVtt(subtitleLines, voiceoverUrl));

  return storageService.saveTextFile(`subtitles/${videoId}.vtt`, subtitleContents);
}

async function createVttFromTimingSidecar(videoId: string): Promise<string | null> {
  const storagePath = process.env['STORAGE_PATH'];

  if (!storagePath) {
    return null;
  }

  const timingFilePath = resolve(join(storagePath, 'audio', `${videoId}.timing.json`));

  try {
    const timingContents = await readFile(timingFilePath, 'utf8');
    const timingParts = JSON.parse(timingContents) as EdgeSubtitlePart[];

    if (!Array.isArray(timingParts) || timingParts.length === 0) {
      return null;
    }

    const groupedParts = groupSubtitleParts(timingParts);

    return [
      'WEBVTT',
      '',
      ...groupedParts.map((part, index) =>
        `${index + 1}\n${formatTimestamp(part.start)} --> ${formatTimestamp(part.end)}\n${part.text}\n`
      ),
    ].join('\n');
  } catch {
    return null;
  }
}

async function createFallbackVtt(
  subtitleLines: string[],
  voiceoverUrl?: string
): Promise<string> {
  const audioDurationInSeconds = await resolveDurationFromAudio(voiceoverUrl);
  const cueDuration = audioDurationInSeconds / subtitleLines.length;

  return [
    'WEBVTT',
    '',
    ...subtitleLines.map((line, index) => {
      const start = cueDuration * index;
      const end = index === subtitleLines.length - 1 ? audioDurationInSeconds : cueDuration * (index + 1);
      return `${index + 1}\n${formatTimestamp(start * 1000)} --> ${formatTimestamp(end * 1000)}\n${line}\n`;
    }),
  ].join('\n');
}

async function resolveDurationFromAudio(voiceoverUrl?: string): Promise<number> {
  if (!voiceoverUrl) {
    return 6;
  }

  const localAudioPath = resolveLocalStoragePath(voiceoverUrl);

  if (!localAudioPath) {
    return 6;
  }

  try {
    return await getAudioDurationInSeconds(localAudioPath);
  } catch {
    return 6;
  }
}

function groupSubtitleParts(parts: EdgeSubtitlePart[]): Array<{
  readonly end: number;
  readonly start: number;
  readonly text: string;
}> {
  const groupedParts: Array<{ end: number; start: number; text: string }> = [];
  let currentText = '';
  let currentStart = parts[0]?.start ?? 0;
  let currentEnd = parts[0]?.end ?? 0;
  let currentWordCount = 0;

  for (const part of parts) {
    currentText += part.part;
    currentEnd = part.end;
    currentWordCount += part.part.trim().length > 0 ? 1 : 0;

    if (currentWordCount >= 5 || /[.!?…]$/.test(part.part.trim())) {
      groupedParts.push({
        start: currentStart,
        end: currentEnd,
        text: currentText.trim(),
      });
      currentText = '';
      currentStart = part.end;
      currentWordCount = 0;
    }
  }

  if (currentText.trim().length > 0) {
    groupedParts.push({
      start: currentStart,
      end: currentEnd,
      text: currentText.trim(),
    });
  }

  return groupedParts;
}

function formatTimestamp(milliseconds: number): string {
  const totalMilliseconds = Math.max(0, Math.round(milliseconds));
  const hours = Math.floor(totalMilliseconds / 3_600_000);
  const minutes = Math.floor((totalMilliseconds % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMilliseconds % 60_000) / 1000);
  const ms = totalMilliseconds % 1000;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${padMilliseconds(ms)}`;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function padMilliseconds(value: number): string {
  return value.toString().padStart(3, '0');
}
