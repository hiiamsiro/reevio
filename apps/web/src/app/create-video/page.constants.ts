import type { CtaType } from './content-studio';

export const promptPresets = [
  'Create a vertical sneaker launch ad with chrome lighting, fast macro cuts, and a final 15% off CTA.',
  'Generate a skincare promo with soft glass textures, ingredient callouts, and calm premium narration.',
  'Build a SaaS feature reveal video with bold captions, UI zoom transitions, and a founder-style voiceover.',
] as const;

export const styleModes = [
  'Cinematic neon',
  'Clean product studio',
  'Creator UGC',
  'Luxury editorial',
] as const;

export const workflowNotes = [
  'Credits are reserved before processing starts.',
  'Failed final renders refund credits automatically.',
  'Preview state refreshes every 2.5 seconds.',
  'Voiceover and subtitles appear after orchestration.',
] as const;

export const INITIAL_HOOK_SOURCE = 'Compact espresso machine for busy home baristas';
export const INITIAL_PROMPT =
  'Create an affiliate video for a compact espresso machine with strong hook and CTA.';
export const CTA_TYPES: readonly CtaType[] = ['urgency', 'scarcity', 'discount'];
