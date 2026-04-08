export function generateTtsTrack(videoId: string, voiceoverText: string): string {
  if (voiceoverText.trim().length === 0) {
    throw new Error('Voiceover text is required for TTS generation.');
  }

  return `storage://generated/audio/${videoId}.mp3`;
}
