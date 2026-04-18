import { ProviderDefinition } from './provider.types';

export const PROVIDER_DEFINITIONS: readonly ProviderDefinition[] = [
  {
    name: 'remotion',
    label: 'Remotion',
    description:
      'The only active render pipeline. Video jobs are routed through the Remotion renderer.',
    status: 'available',
    priceTier: 'free',
    creditCost: 0,
    capabilities: {
      supportsSubtitles: true,
      supportsVoiceover: true,
      supportsVerticalVideo: true,
      supportsPromptOptimization: true,
    },
  },
];
