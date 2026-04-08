import { VideoGenerationJobData } from '@reevio/types';
import { ParsedPromptData } from '@reevio/types';
import { GeneratedScriptPlan } from './ai-orchestrator.types';
import { runWithRetryAndFallback } from './run-with-retry-and-fallback';

const AI_STEP_RETRIES = 2;

export async function generateScript(
  extractedData: ParsedPromptData,
  jobData: VideoGenerationJobData
): Promise<GeneratedScriptPlan> {
  return runWithRetryAndFallback({
    label: 'generateScript',
    retries: AI_STEP_RETRIES,
    primaryTask: async () => createPrimaryScript(extractedData, jobData),
    fallbackTask: async () => createFallbackScript(extractedData, jobData),
  });
}

function createPrimaryScript(
  extractedData: ParsedPromptData,
  jobData: VideoGenerationJobData
): GeneratedScriptPlan {
  if (extractedData.highlights.length === 0) {
    throw new Error('No highlights available for primary script generation.');
  }

  return {
    title: `${extractedData.productName} promo`,
    tagline: `Built for ${extractedData.audience} with ${jobData.provider}`,
    script: [
      `Open fast and frame ${extractedData.productName} as the hero.`,
      `Show ${extractedData.highlights[0]} as the lead benefit.`,
      `Close with a direct CTA that serves ${extractedData.primaryGoal}.`,
    ].join(' '),
    beats: [
      {
        id: `${jobData.videoId}-beat-hook`,
        narration: `Here is why ${extractedData.productName} gets attention quickly.`,
        visualDirection: 'High-energy hook with dynamic text overlay.',
      },
      {
        id: `${jobData.videoId}-beat-benefit`,
        narration: `Lead with ${extractedData.highlights[0]} and make the payoff obvious.`,
        visualDirection: 'Benefit reveal with product motion and feature callouts.',
      },
      {
        id: `${jobData.videoId}-beat-cta`,
        narration: `Wrap with confidence and invite the click right now.`,
        visualDirection: 'Strong CTA card with urgency and brand lockup.',
      },
    ],
    voiceoverText: `Meet ${extractedData.productName}. See the standout value fast and click through for the full offer.`,
    subtitleLines: [
      `Meet ${extractedData.productName}`,
      `Lead with ${extractedData.highlights[0]}`,
      'Click now for the full offer',
    ],
  };
}

function createFallbackScript(
  extractedData: ParsedPromptData,
  jobData: VideoGenerationJobData
): GeneratedScriptPlan {
  return {
    title: `${extractedData.productName} highlight reel`,
    tagline: `Quick conversion-focused story for ${jobData.provider}`,
    script: [
      `Start with ${extractedData.productName}.`,
      'Show one clear benefit.',
      `End with a simple CTA for ${extractedData.primaryGoal}.`,
    ].join(' '),
    beats: [
      {
        id: `${jobData.videoId}-fallback-1`,
        narration: `Introduce ${extractedData.productName} fast.`,
        visualDirection: 'Simple product hero with bold caption.',
      },
      {
        id: `${jobData.videoId}-fallback-2`,
        narration: 'Show one value point and keep momentum high.',
        visualDirection: 'Single feature slide with kinetic text.',
      },
      {
        id: `${jobData.videoId}-fallback-3`,
        narration: 'Close with one CTA and a clear next step.',
        visualDirection: 'CTA end card with product and offer.',
      },
    ],
    voiceoverText: `${extractedData.productName} helps buyers move faster. Watch the benefit and click for more.`,
    subtitleLines: ['See the value fast', 'One clear benefit', 'Tap for more'],
  };
}
