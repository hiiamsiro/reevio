import type { ParsedPromptData } from '@reevio/types';

export interface CreativeProfile {
  readonly angle:
    | 'beauty-editorial'
    | 'launch-hype'
    | 'product-demo'
    | 'story-led'
    | 'tech-explainer'
    | 'luxury-generic';
  readonly endingDevice: string;
  readonly layouts: readonly string[];
  readonly motionDirection: string;
  readonly openingDevice: string;
  readonly pacing: 'aggressive' | 'dynamic' | 'measured';
  readonly palette: string;
  readonly renderMode: 'image-led' | 'motion-only';
  readonly visualStyle: string;
}

export function deriveCreativeProfile(
  extractedData: ParsedPromptData
): CreativeProfile {
  const prompt = extractedData.rawPrompt.toLowerCase();
  const product = extractedData.productName.toLowerCase();

  if (matchesAny(prompt, product, ['serum', 'skincare', 'beauty', 'glow', 'routine'])) {
    return {
      angle: 'beauty-editorial',
      visualStyle: 'soft editorial beauty cinematography with premium closeups',
      motionDirection: 'graceful camera drift, slow parallax, and delicate text motion',
      palette: 'soft champagne highlights, skin-tone warmth, and luminous glow',
      pacing: 'measured',
      renderMode: 'image-led',
      layouts: ['editorial portrait', 'centered poster', 'split composition', 'hero product focus'],
      openingDevice: 'begin with an intimate routine detail that feels aspirational and human',
      endingDevice: 'end on a luminous beauty reveal with a calm premium brand finish',
    };
  }

  if (matchesAny(prompt, product, ['launch', 'drop', 'sneaker', 'hype', 'streetwear'])) {
    return {
      angle: 'launch-hype',
      visualStyle: 'high-contrast product cinematography with dramatic commercial framing',
      motionDirection: 'fast cuts, flash transitions, punchy zooms, and energetic camera movement',
      palette: 'deep shadows, glossy highlights, bold contrast, and metallic accents',
      pacing: 'aggressive',
      renderMode: 'image-led',
      layouts: ['centered poster', 'hero product focus', 'split composition', 'editorial portrait'],
      openingDevice: 'start with a bold visual interruption that creates instant hype',
      endingDevice: 'finish on a hero lockup that feels collectible, exclusive, and urgent',
    };
  }

  if (
    matchesAny(prompt, product, [
      'app',
      'saas',
      'dashboard',
      'software',
      'subtitle',
      'editor',
      'ai',
      'agent',
      'automation',
      'workflow',
      'tool',
      'tools',
      'research',
      'paper',
      'benchmark',
      'model',
      'llm',
      'gpt',
      'claude',
      'openai',
      'anthropic',
      'gemini',
      'cursor',
      'breaking news',
      'update',
      'launch',
    ])
  ) {
    return {
      angle: 'tech-explainer',
      visualStyle: 'clean tech-commercial design with sharp UI hierarchy',
      motionDirection: 'screen zooms, interface parallax, floating callouts, and crisp transitions',
      palette: 'cool graphite surfaces, electric accents, and polished interface glow',
      pacing: 'dynamic',
      renderMode: 'motion-only',
      layouts: ['split composition', 'centered poster', 'hero product focus', 'editorial portrait'],
      openingDevice: 'open with friction or workflow pain, then reveal a cleaner system immediately',
      endingDevice: 'land on a polished workflow payoff with a confident product promise',
    };
  }

  if (matchesAny(prompt, product, ['story', 'routine', 'brand', 'lifestyle', 'morning'])) {
    return {
      angle: 'story-led',
      visualStyle: 'cinematic lifestyle storytelling with atmospheric product framing',
      motionDirection: 'smooth handheld energy, layered reveals, and tasteful editorial transitions',
      palette: 'natural contrast, cinematic warmth, and soft ambient lighting',
      pacing: 'measured',
      renderMode: 'image-led',
      layouts: ['editorial portrait', 'split composition', 'hero product focus', 'centered poster'],
      openingDevice: 'start inside a real human moment before revealing the product role',
      endingDevice: 'close on an emotional payoff that still feels commercially polished',
    };
  }

  if (matchesAny(prompt, product, ['espresso', 'coffee', 'maker', 'product', 'demo'])) {
    return {
      angle: 'product-demo',
      visualStyle: 'premium commercial product demo with tactile closeups',
      motionDirection: 'confident handheld motion, punch-ins, speed ramps, and smooth match cuts',
      palette: 'warm highlights, rich texture, and premium studio contrast',
      pacing: 'dynamic',
      renderMode: 'image-led',
      layouts: ['hero product focus', 'split composition', 'centered poster', 'editorial portrait'],
      openingDevice: 'lead with the problem-to-payoff contrast in the very first beat',
      endingDevice: 'finish on a satisfying product hero moment with strong brand clarity',
    };
  }

  return {
    angle: 'luxury-generic',
    visualStyle: 'polished premium social-video direction with cinematic framing',
    motionDirection: 'elegant motion, layered transitions, and cinematic push-ins',
    palette: 'deep contrast, refined highlights, and luxury commercial lighting',
    pacing: 'dynamic',
    renderMode: 'image-led',
    layouts: ['hero product focus', 'centered poster', 'split composition', 'editorial portrait'],
    openingDevice: 'start with a clear thumb-stopping moment that defines the mood immediately',
    endingDevice: 'close on a premium final frame with a memorable visual payoff',
  };
}

export function getPreferredSceneDurations(
  profile: CreativeProfile,
  sceneCount: number
): number[] {
  const baseDurations =
    profile.pacing === 'aggressive'
      ? [3, 3, 3, 4]
      : profile.pacing === 'measured'
        ? [4, 4, 4, 4]
        : [3, 4, 4, 3];

  return Array.from({ length: sceneCount }, (_unused, index) =>
    baseDurations[index] ?? baseDurations[baseDurations.length - 1] ?? 4
  );
}

function matchesAny(prompt: string, product: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => prompt.includes(keyword) || product.includes(keyword));
}

export function shouldUseMotionGraphics(extractedData: ParsedPromptData): boolean {
  return deriveCreativeProfile(extractedData).renderMode === 'motion-only';
}
