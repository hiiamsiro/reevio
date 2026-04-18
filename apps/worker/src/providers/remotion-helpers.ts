import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { isAbsolute, relative } from 'node:path';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { stat } from 'node:fs/promises';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import type { BuiltScene, VideoAspectRatio } from '@reevio/types';
import { getAudioDurationInSeconds } from '../voice/get-audio-duration';
import { resolveLocalStoragePath } from '../storage/resolve-local-storage-path';
import type { RemotionVideoProps, SubtitleCue } from '../remotion/remotion.types';

let bundledServeUrlPromise: Promise<string> | null = null;

export async function renderRemotionVideo(input: {
  readonly aspectRatio: VideoAspectRatio;
  readonly builtScenes: BuiltScene[];
  readonly subtitlesUrl: string;
  readonly videoId: string;
  readonly voiceoverUrl: string;
}): Promise<{
  readonly durationInSeconds: number;
  readonly fileBytes: Uint8Array;
}> {
  const serveUrl = await getBundledServeUrl();
  const assetServer = await createLocalAssetServer();
  const subtitleCues = await loadSubtitleCues(input.subtitlesUrl);
  const durationInSeconds = await getDurationInSeconds(
    input.voiceoverUrl,
    input.builtScenes,
    subtitleCues
  );
  const inputProps: RemotionVideoProps = {
    aspectRatio: input.aspectRatio,
    builtScenes: input.builtScenes.map((scene) => ({
      ...scene,
      assetUrl: assetServer ? rewriteLocalStorageUrl(scene.assetUrl, assetServer.baseUrl) : scene.assetUrl,
    })),
    durationInSeconds,
    subtitleCues,
    voiceoverUrl: assetServer
      ? rewriteLocalStorageUrl(input.voiceoverUrl, assetServer.baseUrl)
      : input.voiceoverUrl,
  };

  try {
    const composition = await selectComposition({
      serveUrl,
      id: 'reevio-video',
      inputProps: inputProps as Record<string, unknown>,
    });

    const outputLocation = join(tmpdir(), `${input.videoId}.mp4`);
    await renderMedia({
      codec: 'h264',
      audioCodec: 'aac',
      composition,
      inputProps: inputProps as Record<string, unknown>,
      outputLocation,
      overwrite: true,
      serveUrl,
    });

    return {
      durationInSeconds,
      fileBytes: new Uint8Array(await readFile(outputLocation)),
    };
  } finally {
    await assetServer?.close();
  }
}

async function getBundledServeUrl(): Promise<string> {
  if (!bundledServeUrlPromise) {
    bundledServeUrlPromise = bundle({
      entryPoint: resolveRemotionEntryPoint(),
    });
  }

  return bundledServeUrlPromise;
}

function resolveRemotionEntryPoint(): string {
  const workerLocalEntryPoint = resolve(process.cwd(), 'src/remotion/index.ts');

  if (existsSync(workerLocalEntryPoint)) {
    return workerLocalEntryPoint;
  }

  return resolve(process.cwd(), 'apps/worker/src/remotion/index.ts');
}

async function createLocalAssetServer(): Promise<{
  readonly baseUrl: string;
  readonly close: () => Promise<void>;
} | null> {
  const storageRoot = process.env['STORAGE_PATH'];

  if (process.env['STORAGE_DRIVER'] !== 'local' || !storageRoot) {
    return null;
  }

  const resolvedStorageRoot = resolve(storageRoot);
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');

      if (!requestUrl.pathname.startsWith('/storage/')) {
        response.statusCode = 404;
        response.end('Not found');
        return;
      }

      const relativePath = decodeURIComponent(requestUrl.pathname.replace(/^\/storage\//, ''));
      const absolutePath = resolve(join(resolvedStorageRoot, relativePath));
      const relativeTargetPath = relative(resolvedStorageRoot, absolutePath);

      if (
        relativePath.length === 0 ||
        relativeTargetPath.startsWith('..') ||
        isAbsolute(relativeTargetPath)
      ) {
        response.statusCode = 400;
        response.end('Invalid path');
        return;
      }

      const fileStat = await stat(absolutePath);
      const fileContents = await readFile(absolutePath);
      const rangeHeader = request.headers.range;
      response.setHeader('Access-Control-Allow-Origin', '*');
      response.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      response.setHeader('Access-Control-Allow-Headers', '*');
      response.setHeader('Accept-Ranges', 'bytes');
      response.setHeader('Content-Type', getContentType(absolutePath));

      if (rangeHeader) {
        const parsedRange = parseRangeHeader(rangeHeader, fileStat.size);

        if (!parsedRange) {
          response.statusCode = 416;
          response.setHeader('Content-Range', `bytes */${fileStat.size}`);
          response.end();
          return;
        }

        response.statusCode = 206;
        response.setHeader(
          'Content-Range',
          `bytes ${parsedRange.start}-${parsedRange.end}/${fileStat.size}`
        );
        response.setHeader('Content-Length', parsedRange.end - parsedRange.start + 1);
        response.end(fileContents.subarray(parsedRange.start, parsedRange.end + 1));
        return;
      }

      response.setHeader('Content-Length', fileStat.size);
      response.end(fileContents);
    } catch {
      response.statusCode = 404;
      response.end('Not found');
    }
  });

  await new Promise<void>((resolvePromise) => {
    server.listen(0, '127.0.0.1', () => resolvePromise());
  });

  const address = server.address();

  if (!address || typeof address === 'string') {
    await new Promise<void>((resolvePromise, rejectPromise) => {
      server.close((error) => {
        if (error) {
          rejectPromise(error);
          return;
        }

        resolvePromise();
      });
    });
    return null;
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}/storage/`,
    close: () =>
      new Promise<void>((resolvePromise, rejectPromise) => {
        server.close((error) => {
          if (error) {
            rejectPromise(error);
            return;
          }

          resolvePromise();
        });
      }),
  };
}

function rewriteLocalStorageUrl(url: string, baseUrl: string): string {
  const storagePublicBaseUrl =
    process.env['STORAGE_PUBLIC_BASE_URL'] ?? process.env['API_URL'];

  if (!storagePublicBaseUrl) {
    return url;
  }

  const normalizedBase = `${storagePublicBaseUrl.replace(/\/$/, '')}/storage/`;

  if (!url.startsWith(normalizedBase)) {
    return url;
  }

  return `${baseUrl}${url.slice(normalizedBase.length)}`;
}

async function loadSubtitleCues(subtitlesUrl: string): Promise<SubtitleCue[]> {
  const localPath = resolveLocalStoragePath(subtitlesUrl);

  if (!localPath) {
    return [];
  }

  const vttContents = await readFile(localPath, 'utf8');
  return parseVtt(vttContents);
}

function parseVtt(vttContents: string): SubtitleCue[] {
  const lines = vttContents.split(/\r?\n/);
  const cues: SubtitleCue[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const timingLine = lines[index]?.trim() ?? '';

    if (!timingLine.includes('-->')) {
      continue;
    }

    const [start = '00:00:00.000', end = '00:00:00.000'] = timingLine
      .split('-->')
      .map((value) => value.trim());
    const textLines: string[] = [];

    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const candidate = lines[cursor]?.trim() ?? '';

      if (!candidate) {
        break;
      }

      textLines.push(candidate);
      index = cursor;
    }

    cues.push({
      startMs: parseTimestamp(start),
      endMs: parseTimestamp(end),
      text: textLines.join(' '),
    });
  }

  return cues;
}

function parseTimestamp(timestamp: string): number {
  const [timePart = '00:00:00', millisecondPart = '0'] = timestamp.split('.');
  const [hours = '0', minutes = '0', seconds = '0'] = timePart.split(':');

  return (
    Number.parseInt(hours, 10) * 3_600_000 +
    Number.parseInt(minutes, 10) * 60_000 +
    Number.parseInt(seconds, 10) * 1000 +
    Number.parseInt(millisecondPart.padEnd(3, '0'), 10)
  );
}

async function getDurationInSeconds(
  voiceoverUrl: string,
  builtScenes: readonly BuiltScene[],
  subtitleCues: readonly SubtitleCue[]
): Promise<number> {
  const localAudioPath = resolveLocalStoragePath(voiceoverUrl);
  const cueDurationInSeconds = getSubtitleDurationInSeconds(subtitleCues);
  const sceneDurationInSeconds = getSceneDurationInSeconds(builtScenes);

  if (!localAudioPath) {
    return Math.max(cueDurationInSeconds, sceneDurationInSeconds);
  }

  try {
    return Math.max(
      await getAudioDurationInSeconds(localAudioPath),
      cueDurationInSeconds,
      sceneDurationInSeconds
    );
  } catch {
    return Math.max(cueDurationInSeconds, sceneDurationInSeconds);
  }
}

function getSceneDurationInSeconds(builtScenes: readonly BuiltScene[]): number {
  return builtScenes.reduce(
    (totalDuration, scene) => totalDuration + scene.durationInSeconds,
    0
  );
}

function getSubtitleDurationInSeconds(subtitleCues: readonly SubtitleCue[]): number {
  const lastCueEndMs = subtitleCues.reduce(
    (latestEndMs, cue) => Math.max(latestEndMs, cue.endMs),
    0
  );

  return lastCueEndMs / 1000;
}

function getContentType(filePath: string): string {
  if (filePath.endsWith('.mp3')) {
    return 'audio/mpeg';
  }

  if (filePath.endsWith('.vtt')) {
    return 'text/vtt; charset=utf-8';
  }

  if (filePath.endsWith('.png')) {
    return 'image/png';
  }

  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
    return 'image/jpeg';
  }

  if (filePath.endsWith('.webp')) {
    return 'image/webp';
  }

  return 'application/octet-stream';
}

function parseRangeHeader(
  rangeHeader: string,
  fileSize: number
): { readonly end: number; readonly start: number } | null {
  const matchedRange = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());

  if (!matchedRange) {
    return null;
  }

  const [, rawStart = '', rawEnd = ''] = matchedRange;

  if (rawStart === '' && rawEnd === '') {
    return null;
  }

  if (rawStart === '') {
    const suffixLength = Number.parseInt(rawEnd, 10);

    if (!Number.isFinite(suffixLength) || suffixLength <= 0) {
      return null;
    }

    return {
      start: Math.max(0, fileSize - suffixLength),
      end: fileSize - 1,
    };
  }

  const start = Number.parseInt(rawStart, 10);
  const end = rawEnd === '' ? fileSize - 1 : Number.parseInt(rawEnd, 10);

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start < 0 ||
    end < start ||
    start >= fileSize
  ) {
    return null;
  }

  return {
    start,
    end: Math.min(end, fileSize - 1),
  };
}
