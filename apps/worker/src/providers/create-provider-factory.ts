import { ProviderFactory } from './provider-factory';
import { GoogleFlowProvider } from './google-flow-provider';
import { GrokProvider } from './grok-provider';
import { RemotionProvider } from './remotion-provider';
import { createStorageService } from '../storage/storage.factory';
import { TopviewProvider } from './topview-provider';
import { VeoProvider } from './veo-provider';

export function createProviderFactory(): ProviderFactory {
  const storageService = createStorageService();

  return new ProviderFactory([
    new RemotionProvider(storageService),
    new TopviewProvider(process.env['TOPVIEW_API_KEY'], storageService),
    new GrokProvider(process.env['GROK_API_KEY'], storageService),
    new GoogleFlowProvider(process.env['GOOGLE_FLOW_API_KEY'], storageService),
    new VeoProvider(process.env['VEO_API_KEY'], storageService),
  ]);
}
