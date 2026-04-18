import { ProviderFactory } from './provider-factory';
import { RemotionProvider } from './remotion-provider';
import { createStorageService } from '../storage/storage.factory';

export function createProviderFactory(): ProviderFactory {
  const storageService = createStorageService();

  return new ProviderFactory([new RemotionProvider(storageService)]);
}
