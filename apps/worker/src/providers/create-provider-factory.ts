import { ProviderFactory } from './provider-factory';
import { GoogleFlowProvider } from './google-flow-provider';
import { GrokProvider } from './grok-provider';
import { RemotionProvider } from './remotion-provider';
import { TopviewProvider } from './topview-provider';
import { VeoProvider } from './veo-provider';

export function createProviderFactory(): ProviderFactory {
  return new ProviderFactory([
    new RemotionProvider(),
    new TopviewProvider(process.env['TOPVIEW_API_KEY']),
    new GrokProvider(process.env['GROK_API_KEY']),
    new GoogleFlowProvider(process.env['GOOGLE_FLOW_API_KEY']),
    new VeoProvider(process.env['VEO_API_KEY']),
  ]);
}
