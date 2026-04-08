import { Controller, Get } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderDefinition } from './provider.types';

interface ProviderCatalogResponse {
  readonly success: true;
  readonly data: readonly ProviderDefinition[];
  readonly error: null;
}

@Controller('providers')
export class ProviderController {
  public constructor(private readonly providerService: ProviderService) {}

  @Get()
  public getProviders(): ProviderCatalogResponse {
    return {
      success: true,
      data: this.providerService.getProviders(),
      error: null,
    };
  }
}
