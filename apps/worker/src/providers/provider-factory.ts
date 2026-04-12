import { VideoProvider } from './video-provider.types';

const PROVIDER_FALLBACK_CHAINS: Record<VideoProvider['name'], VideoProvider['name'][]> = {
  veo: ['veo', 'topview', 'grok', 'remotion'],
  gemini: ['gemini'],
  topview: ['topview', 'grok', 'remotion'],
  grok: ['grok', 'remotion'],
  remotion: ['remotion'],
  flow: ['flow'],
};

export class ProviderFactory {
  private readonly providers: Map<VideoProvider['name'], VideoProvider>;

  public constructor(providers: VideoProvider[]) {
    this.providers = new Map(providers.map((provider) => [provider.name, provider]));
  }

  public getProvider(providerName: VideoProvider['name']): VideoProvider {
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`Video provider "${providerName}" is not registered.`);
    }

    return provider;
  }

  public async generateVideo(
    providerName: VideoProvider['name'],
    input: Parameters<VideoProvider['generateVideo']>[0]
  ) {
    const providerChain = PROVIDER_FALLBACK_CHAINS[providerName];
    let lastError: unknown = null;

    for (const fallbackProviderName of providerChain) {
      const provider = this.getProvider(fallbackProviderName);

      try {
        return await provider.generateVideo(input);
      } catch (error: unknown) {
        lastError = error;
        console.warn(
          JSON.stringify({
            level: 'warn',
            provider: fallbackProviderName,
            message: getErrorMessage(error),
          })
        );
      }
    }

    throw new Error(
      `All provider attempts failed for "${providerName}". Last error: ${getErrorMessage(lastError)}`
    );
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown provider error';
}
