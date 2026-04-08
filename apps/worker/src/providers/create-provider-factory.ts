import { ProviderFactory } from './provider-factory';
import { RemotionProvider } from './remotion-provider';

export function createProviderFactory(): ProviderFactory {
  return new ProviderFactory([new RemotionProvider()]);
}
