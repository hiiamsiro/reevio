import { ParsedPromptData, SceneOutline, VideoGenerationJobData } from '@reevio/types';
import { createGenerateImagePromptsTemplate } from '../prompt-engine/prompt-templates';
import { runWithRetryAndFallback } from './run-with-retry-and-fallback';

const AI_STEP_RETRIES = 2;

export async function generateImagePrompts(
  extractedData: ParsedPromptData,
  scenes: SceneOutline[],
  jobData: VideoGenerationJobData
): Promise<string[]> {
  return runWithRetryAndFallback({
    label: 'generateImagePrompts',
    retries: AI_STEP_RETRIES,
    primaryTask: async () => createPrimaryImagePrompts(extractedData, scenes, jobData),
    fallbackTask: async () => createFallbackImagePrompts(extractedData, scenes, jobData),
  });
}

function createPrimaryImagePrompts(
  extractedData: ParsedPromptData,
  scenes: SceneOutline[],
  jobData: VideoGenerationJobData
): string[] {
  const promptTemplate = createGenerateImagePromptsTemplate(extractedData, scenes, jobData);

  if (scenes.length === 0) {
    throw new Error('Scenes are required for primary image prompt generation.');
  }

  if (promptTemplate.userInstruction.length === 0) {
    throw new Error('Primary image prompt template is empty.');
  }

  return scenes.map(
    (scene) =>
      `${scene.visualPrompt}. Emphasize ${extractedData.productName}, affiliate style, ${jobData.aspectRatio}.`
  );
}

function createFallbackImagePrompts(
  extractedData: ParsedPromptData,
  scenes: SceneOutline[],
  jobData: VideoGenerationJobData
): string[] {
  const promptTemplate = createGenerateImagePromptsTemplate(extractedData, scenes, jobData);

  if (promptTemplate.systemInstruction.length === 0) {
    throw new Error('Fallback image prompt template is empty.');
  }

  return scenes.map(
    (_scene, index) =>
      `Clean product marketing image ${index + 1} for ${extractedData.productName} in ${jobData.aspectRatio}.`
  );
}
