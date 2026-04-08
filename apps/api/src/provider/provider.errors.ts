export class ProviderNotFoundError extends Error {
  public readonly code: string;

  public constructor(providerName: string) {
    super(`Video provider "${providerName}" is not configured.`);
    this.name = 'ProviderNotFoundError';
    this.code = 'PROVIDER_NOT_FOUND';
  }
}
