import { StorageService } from '../storage/storage.types';

export async function generateTtsTrack(
  videoId: string,
  voiceoverText: string,
  storageService: StorageService
): Promise<string> {
  if (voiceoverText.trim().length === 0) {
    throw new Error('Voiceover text is required for TTS generation.');
  }

  return storageService.saveTextFile(`audio/${videoId}.mp3`, voiceoverText);
}
