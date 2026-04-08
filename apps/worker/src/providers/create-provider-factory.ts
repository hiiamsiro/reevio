import { ProviderFactory } from './provider-factory';
import { GoogleFlowProvider } from './google-flow-provider';
import { GrokProvider } from './grok-provider';
import { RemotionProvider } from './remotion-provider';
import { TopviewProvider } from './topview-provider';
import { VeoProvider } from './veo-provider';

export function createProviderFactory(): ProviderFactory {
  return new ProviderFactory([
    new RemotionProvider(),
    new TopviewProvider(),
    new GrokProvider(),
    new GoogleFlowProvider(),
    new VeoProvider(),
  ]);
}
