import {
  PROVIDER_PRICE_TIER_VALUES,
  PROVIDER_STATUS_VALUES,
  VIDEO_PROVIDER_VALUES,
} from './provider.constants';

export type VideoProviderName = (typeof VIDEO_PROVIDER_VALUES)[number];
export type ProviderPriceTier = (typeof PROVIDER_PRICE_TIER_VALUES)[number];
export type ProviderStatus = (typeof PROVIDER_STATUS_VALUES)[number];

export interface ProviderCapabilities {
  readonly supportsSubtitles: boolean;
  readonly supportsVoiceover: boolean;
  readonly supportsVerticalVideo: boolean;
  readonly supportsPromptOptimization: boolean;
}

export interface ProviderDefinition {
  readonly name: VideoProviderName;
  readonly label: string;
  readonly description: string;
  readonly status: ProviderStatus;
  readonly priceTier: ProviderPriceTier;
  readonly creditCost: number;
  readonly capabilities: ProviderCapabilities;
}
