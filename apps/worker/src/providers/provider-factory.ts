import { VideoProvider } from './video-provider.types';

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
}
