import { ParsedPromptData, SceneOutline, VideoGenerationJobData } from '@reevio/types';
import { GeneratedScriptPlan } from '../ai-orchestrator/ai-orchestrator.types';
import { PromptTemplate } from './prompt-engine.types';

export function createExtractDataPromptTemplate(prompt: string): PromptTemplate {
  return {
    systemInstruction:
      'Extract product, audience, goal, and highlights from an affiliate-video brief.',
    userInstruction: `Brief: ${prompt}`,
  };
}

export function createGenerateScriptPromptTemplate(
  extractedData: ParsedPromptData,
  jobData: VideoGenerationJobData
): PromptTemplate {
  return {
    systemInstruction:
      'Write a short affiliate-video script with a strong hook, payoff, and CTA.',
    userInstruction: `Product: ${extractedData.productName}\nAudience: ${extractedData.audience}\nGoal: ${extractedData.primaryGoal}\nProvider: ${jobData.provider}\nAspectRatio: ${jobData.aspectRatio}`,
  };
}

export function createGenerateScenesPromptTemplate(
  extractedData: ParsedPromptData,
  scriptPlan: GeneratedScriptPlan,
  jobData: VideoGenerationJobData
): PromptTemplate {
  return {
    systemInstruction:
      'Break the script into visual scenes optimized for affiliate-video pacing.',
    userInstruction: `Product: ${extractedData.productName}\nScriptTitle: ${scriptPlan.title}\nVoiceover: ${scriptPlan.voiceoverText}\nAspectRatio: ${jobData.aspectRatio}`,
  };
}

export function createGenerateImagePromptsTemplate(
  extractedData: ParsedPromptData,
  scenes: SceneOutline[],
  jobData: VideoGenerationJobData
): PromptTemplate {
  return {
    systemInstruction:
      'Create concise image prompts that match each scene and emphasize click-driving visuals.',
    userInstruction: `Product: ${extractedData.productName}\nProvider: ${jobData.provider}\nScenes: ${scenes.map((scene) => scene.headline).join(' | ')}`,
  };
}
