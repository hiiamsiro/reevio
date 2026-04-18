import { EdgeTTS } from 'node-edge-tts';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { StorageService } from '../storage/storage.types';

export async function generateTtsTrack(
  videoId: string,
  voiceoverText: string,
  storageService: StorageService
): Promise<string> {
  if (voiceoverText.trim().length === 0) {
    throw new Error('Voiceover text is required for TTS generation.');
  }

  const tempDir = await mkdtemp(join(tmpdir(), 'reevio-tts-'));
  const outputPath = join(tempDir, `${videoId}.mp3`);

  try {
    const edgeTtsBaseConfig = {
      voice: process.env['EDGE_TTS_VOICE'] ?? 'vi-VN-HoaiMyNeural',
      lang: process.env['EDGE_TTS_LANG'] ?? 'vi-VN',
      outputFormat:
        process.env['EDGE_TTS_OUTPUT_FORMAT'] ?? 'audio-24khz-48kbitrate-mono-mp3',
      pitch: process.env['EDGE_TTS_PITCH'] ?? 'default',
      rate: process.env['EDGE_TTS_RATE'] ?? 'default',
      saveSubtitles: false,
      timeout: Number.parseInt(process.env['EDGE_TTS_TIMEOUT_MS'] ?? '15000', 10),
      volume: process.env['EDGE_TTS_VOLUME'] ?? 'default',
    } as const;
    const edgeTts = new EdgeTTS(
      process.env['EDGE_TTS_PROXY']
        ? {
            ...edgeTtsBaseConfig,
            proxy: process.env['EDGE_TTS_PROXY'],
          }
        : edgeTtsBaseConfig
    );
    await edgeTts.ttsPromise(voiceoverText, outputPath);

    const audioBytes = await readFile(outputPath);
    return storageService.saveBinaryFile(`audio/${videoId}.mp3`, audioBytes);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
