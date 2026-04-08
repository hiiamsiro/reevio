import { OrchestratedVideoPlan, ParsedPromptData, VideoGenerationJobData } from '@reevio/types';
import { generateImagePrompts } from './generate-image-prompts';
import { generateScenes } from './generate-scenes';
import { generateScript } from './generate-script';

export async function createAiOrchestration(
  extractedData: ParsedPromptData,
  jobData: VideoGenerationJobData
): Promise<OrchestratedVideoPlan> {
  const scriptPlan = await generateScript(extractedData, jobData);
  const scenes = await generateScenes({
    extractedData,
    scriptPlan,
    jobData,
  });
  const imagePrompts = await generateImagePrompts(extractedData, scenes, jobData);

  return {
    title: scriptPlan.title,
    tagline: scriptPlan.tagline,
    script: scriptPlan.script,
    beats: scriptPlan.beats,
    scenes,
    imagePrompts,
    voiceoverText: scriptPlan.voiceoverText,
    subtitleLines: scriptPlan.subtitleLines,
    durationInSeconds: scenes.reduce(
      (totalDuration, scene) => totalDuration + scene.durationInSeconds,
      0
    ),
  };
}
