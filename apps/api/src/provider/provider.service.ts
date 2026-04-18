import { Injectable } from '@nestjs/common';
import { PROVIDER_DEFINITIONS } from './provider.data';
import { ProviderNotFoundError, ProviderUnavailableError } from './provider.errors';
import { ProviderDefinition, VideoProviderName } from './provider.types';

@Injectable()
export class ProviderService {
  public getProviders(): readonly ProviderDefinition[] {
    return PROVIDER_DEFINITIONS;
  }

  public getProvider(providerName: VideoProviderName): ProviderDefinition {
    const providerDefinition = PROVIDER_DEFINITIONS.find(
      (definition) => definition.name === providerName
    );

    if (!providerDefinition) {
      throw new ProviderNotFoundError(providerName);
    }

    return providerDefinition;
  }

  public getCreatableProvider(providerName: VideoProviderName): ProviderDefinition {
    const providerDefinition = this.getProvider(providerName);

    if (providerDefinition.status === 'disabled') {
      throw new ProviderUnavailableError(providerName);
    }

    return providerDefinition;
  }

  public isProviderSupported(providerName: string): providerName is VideoProviderName {
    return PROVIDER_DEFINITIONS.some((definition) => definition.name === providerName);
  }
}
