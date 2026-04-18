import { SceneOutline } from '@reevio/types';
import { createGenerateScenesPromptTemplate } from '../prompt-engine/prompt-templates';
import { SceneGenerationInput } from './ai-orchestrator.types';
import {
  deriveCreativeProfile,
  getPreferredSceneDurations,
} from './creative-direction';
import { runWithRetryAndFallback } from './run-with-retry-and-fallback';

const AI_STEP_RETRIES = 2;

export async function generateScenes(input: SceneGenerationInput): Promise<SceneOutline[]> {
  return runWithRetryAndFallback({
    label: 'generateScenes',
    retries: AI_STEP_RETRIES,
    primaryTask: async () => createPrimaryScenes(input),
    fallbackTask: async () => createFallbackScenes(input),
  });
}

function createPrimaryScenes(input: SceneGenerationInput): SceneOutline[] {
  const promptTemplate = createGenerateScenesPromptTemplate(
    input.extractedData,
    input.scriptPlan,
    input.jobData
  );

  if (input.scriptPlan.beats.length < 3) {
    throw new Error('Primary scene generation requires at least 3 beats.');
  }

  if (promptTemplate.userInstruction.length === 0) {
    throw new Error('Primary scene prompt template is empty.');
  }

  const creativeProfile = deriveCreativeProfile(input.extractedData);
  const sceneDurations = getPreferredSceneDurations(
    creativeProfile,
    input.scriptPlan.beats.length
  );

  return input.scriptPlan.beats.map((beat, index) => ({
    id: `${input.jobData.videoId}-scene-${index + 1}`,
    headline: createSceneHeadline(input.extractedData.productName, input.extractedData.highlights, index),
    narration: beat.narration,
    visualPrompt: [
      beat.visualDirection,
      creativeProfile.renderMode === 'motion-only'
        ? 'Render this as full animation motion graphics. Avoid stock-photo look, avoid static hero images, and use native editorial shapes, UI panels, chart bars, glow accents, and kinetic type.'
        : 'Use a premium still image as the hero layer with motion added in post.',
      `Build this scene as ${creativeProfile.layouts[index % creativeProfile.layouts.length]}.`,
      `Use ${creativeProfile.visualStyle}.`,
      `Motion should feel like ${creativeProfile.motionDirection}.`,
      `Color and light direction: ${creativeProfile.palette}.`,
      `Short-form commercial frame for ${input.extractedData.productName} in ${input.jobData.aspectRatio}.`,
    ].join(' '),
    durationInSeconds: sceneDurations[index] ?? 4,
  }));
}

function createFallbackScenes(input: SceneGenerationInput): SceneOutline[] {
  const promptTemplate = createGenerateScenesPromptTemplate(
    input.extractedData,
    input.scriptPlan,
    input.jobData
  );

  if (promptTemplate.systemInstruction.length === 0) {
    throw new Error('Fallback scene prompt template is empty.');
  }

  const creativeProfile = deriveCreativeProfile(input.extractedData);
  const sceneDurations = getPreferredSceneDurations(creativeProfile, 3);

  return [
    {
      id: `${input.jobData.videoId}-scene-fallback-1`,
      headline: `${input.extractedData.productName}`,
      narration: `Introduce ${input.extractedData.productName} with a strong opening beat and immediate visual clarity.`,
      visualPrompt: `Hero shot of ${input.extractedData.productName} in ${input.jobData.aspectRatio}. ${creativeProfile.renderMode === 'motion-only' ? 'Render as full animation motion graphics with editorial panels, neon accents, and typography-led storytelling.' : 'Use a premium hero image with layered motion.'} Use ${creativeProfile.layouts[0]} framing, ${creativeProfile.visualStyle}, and ${creativeProfile.palette}.`,
      durationInSeconds: sceneDurations[0] ?? 4,
    },
    {
      id: `${input.jobData.videoId}-scene-fallback-2`,
      headline: 'Value in focus',
      narration: 'Show one strong proof moment and keep the visual language polished.',
      visualPrompt: `Feature showcase for ${input.extractedData.productName}. ${creativeProfile.renderMode === 'motion-only' ? 'Use motion-design callouts, interface cards, and animated proof bars.' : 'Use a premium still visual.'} Use ${creativeProfile.layouts[1]} framing and ${creativeProfile.motionDirection}.`,
      durationInSeconds: sceneDurations[1] ?? 4,
    },
    {
      id: `${input.jobData.videoId}-scene-fallback-3`,
      headline: 'Premium finish',
      narration: 'End with a clear product memory and a stronger branded payoff.',
      visualPrompt: `Final branded end card for ${input.extractedData.productName}. ${creativeProfile.renderMode === 'motion-only' ? 'Finish with fully animated typography, glow, and premium motion-design framing.' : 'Use a premium final still frame.'} Use ${creativeProfile.layouts[2]} framing and ${creativeProfile.endingDevice}.`,
      durationInSeconds: sceneDurations[2] ?? 4,
    },
  ];
}

function createSceneHeadline(
  productName: string,
  highlights: readonly string[],
  index: number
): string {
  const cleanHighlights = highlights
    .map((highlight) => highlight.trim())
    .filter((highlight) => highlight.length > 0);

  if (index === 0) {
    return productName;
  }

  const mappedHighlight = cleanHighlights[index - 1];
  if (mappedHighlight) {
    return mappedHighlight;
  }

  return index === cleanHighlights.length + 1 ? 'Final payoff' : 'Visual proof';
}
