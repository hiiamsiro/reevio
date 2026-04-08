import { SceneOutline } from '@reevio/types';
import { createGenerateScenesPromptTemplate } from '../prompt-engine/prompt-templates';
import { SceneGenerationInput } from './ai-orchestrator.types';
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

  return input.scriptPlan.beats.map((beat, index) => ({
    id: `${input.jobData.videoId}-scene-${index + 1}`,
    headline:
      index === 0
        ? `Discover ${input.extractedData.productName}`
        : index === input.scriptPlan.beats.length - 1
          ? 'Close the sale'
          : 'Show the payoff',
    narration: `${beat.narration} ${promptTemplate.systemInstruction}`,
    visualPrompt: `${beat.visualDirection} for ${input.extractedData.productName} in ${input.jobData.aspectRatio}`,
    durationInSeconds: index === 1 ? 5 : 4,
  }));
}

function createFallbackScenes(input: SceneGenerationInput): SceneOutline[] {
  const promptTemplate = createGenerateScenesPromptTemplate(
    input.extractedData,
    input.scriptPlan,
    input.jobData
  );

  return [
    {
      id: `${input.jobData.videoId}-scene-fallback-1`,
      headline: `Meet ${input.extractedData.productName}`,
      narration: `Introduce ${input.extractedData.productName} with a quick visual hook. ${promptTemplate.systemInstruction}`,
      visualPrompt: `Hero shot of ${input.extractedData.productName} in ${input.jobData.aspectRatio}`,
      durationInSeconds: 4,
    },
    {
      id: `${input.jobData.videoId}-scene-fallback-2`,
      headline: 'Why it matters',
      narration: 'Focus on one clear benefit and keep the pacing tight.',
      visualPrompt: `Feature showcase for ${input.extractedData.productName}`,
      durationInSeconds: 4,
    },
    {
      id: `${input.jobData.videoId}-scene-fallback-3`,
      headline: 'Take action',
      narration: 'Finish with urgency and a direct CTA.',
      visualPrompt: `CTA end card for ${input.extractedData.productName}`,
      durationInSeconds: 4,
    },
  ];
}
