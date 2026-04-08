import { ProviderDefinition } from './provider.types';

export const PROVIDER_DEFINITIONS: readonly ProviderDefinition[] = [
  {
    name: 'remotion',
    label: 'Remotion',
    description: 'Template-driven renderer for reliable baseline video output.',
    status: 'available',
    priceTier: 'free',
    capabilities: {
      supportsSubtitles: true,
      supportsVoiceover: true,
      supportsVerticalVideo: true,
      supportsPromptOptimization: false,
    },
  },
  {
    name: 'topview',
    label: 'Topview',
    description: 'Marketing-focused video generation tuned for affiliate assets.',
    status: 'available',
    priceTier: 'pro',
    capabilities: {
      supportsSubtitles: true,
      supportsVoiceover: true,
      supportsVerticalVideo: true,
      supportsPromptOptimization: true,
    },
  },
  {
    name: 'grok',
    label: 'Grok',
    description: 'Fast experimental provider for scripted promo video output.',
    status: 'beta',
    priceTier: 'pro',
    capabilities: {
      supportsSubtitles: true,
      supportsVoiceover: true,
      supportsVerticalVideo: true,
      supportsPromptOptimization: true,
    },
  },
  {
    name: 'flow',
    label: 'Google Flow',
    description: 'High-fidelity creative generation optimized for cinematic scenes.',
    status: 'beta',
    priceTier: 'premium',
    capabilities: {
      supportsSubtitles: true,
      supportsVoiceover: true,
      supportsVerticalVideo: true,
      supportsPromptOptimization: true,
    },
  },
  {
    name: 'veo',
    label: 'Veo',
    description: 'Premium text-to-video generation for flagship renders.',
    status: 'beta',
    priceTier: 'premium',
    capabilities: {
      supportsSubtitles: true,
      supportsVoiceover: true,
      supportsVerticalVideo: true,
      supportsPromptOptimization: true,
    },
  },
] as const;
