import { VideoGenerationJobData } from '@reevio/types';
import { ParsedPromptData } from '@reevio/types';
import { createGenerateScriptPromptTemplate } from '../prompt-engine/prompt-templates';
import { GeneratedScriptPlan } from './ai-orchestrator.types';
import { deriveCreativeProfile } from './creative-direction';
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
  const promptTemplate = createGenerateScriptPromptTemplate(extractedData, jobData);

  if (extractedData.highlights.length === 0) {
    throw new Error('No highlights available for primary script generation.');
  }

  if (promptTemplate.userInstruction.length === 0) {
    throw new Error('Primary script prompt template is empty.');
  }

  const creativeProfile = deriveCreativeProfile(extractedData);
  const highlights = extractedData.highlights.slice(0, 3);
  const spotlightHighlight = highlights[0] ?? extractedData.primaryGoal;
  const supportHighlight = highlights[1] ?? extractedData.audience;
  const payoffHighlight = highlights[2] ?? extractedData.primaryGoal;
  const title = createVideoTitle(extractedData, creativeProfile.angle);
  const beats = [
    {
      id: `${jobData.videoId}-beat-open`,
      narration: `${creativeProfile.openingDevice}. ${extractedData.productName} enters with immediate visual clarity and premium intent.`,
      visualDirection: `${creativeProfile.visualStyle}. Use ${creativeProfile.layouts[0]} framing with ${creativeProfile.motionDirection}. Introduce ${extractedData.productName} as the focus in ${jobData.aspectRatio}.`,
    },
    {
      id: `${jobData.videoId}-beat-proof`,
      narration: `Move quickly into ${spotlightHighlight} so the viewer understands the main advantage without friction.`,
      visualDirection: `Show ${spotlightHighlight} through a more explicit proof moment. Use ${creativeProfile.layouts[1]} framing, premium overlays, and ${creativeProfile.palette}.`,
    },
    {
      id: `${jobData.videoId}-beat-payoff`,
      narration: `Layer in ${supportHighlight} and ${payoffHighlight} so the video feels richer, more convincing, and more complete.`,
      visualDirection: `Create a richer payoff sequence with ${creativeProfile.layouts[2]} framing, stronger motion emphasis, and scroll-stopping composition.`,
    },
    {
      id: `${jobData.videoId}-beat-close`,
      narration: `${creativeProfile.endingDevice}. Leave the viewer with a clear memory of ${extractedData.productName} and a reason to care now.`,
      visualDirection: `Finish with ${creativeProfile.layouts[3]} framing, a refined branded lockup, and a final premium frame for ${extractedData.productName}.`,
    },
  ];

  return {
    title,
    tagline: `${capitalizeWords(creativeProfile.angle.replace(/-/g, ' '))} direction for ${extractedData.audience}`,
    script: beats.map((beat) => beat.narration).join(' '),
    beats,
    voiceoverText: [
      `${extractedData.productName} is presented for ${extractedData.audience} with a ${creativeProfile.angle.replace(/-/g, ' ')} approach.`,
      `The video starts by making the core tension obvious, then quickly proves ${spotlightHighlight}.`,
      `It builds visual momentum around ${supportHighlight} and ends with a sharper payoff tied to ${extractedData.primaryGoal}.`,
    ].join(' '),
    subtitleLines: [
      extractedData.productName,
      simplifyLine(spotlightHighlight),
      simplifyLine(payoffHighlight),
      simplifyLine(extractedData.primaryGoal),
    ],
  };
}

function createFallbackScript(
  extractedData: ParsedPromptData,
  jobData: VideoGenerationJobData
): GeneratedScriptPlan {
  const promptTemplate = createGenerateScriptPromptTemplate(extractedData, jobData);

  if (promptTemplate.systemInstruction.length === 0) {
    throw new Error('Fallback script prompt template is empty.');
  }

  const creativeProfile = deriveCreativeProfile(extractedData);
  const beats = [
    {
      id: `${jobData.videoId}-fallback-1`,
      narration: `${creativeProfile.openingDevice}. Keep the first impression immediately readable.`,
      visualDirection: `Use ${creativeProfile.layouts[0]} framing, ${creativeProfile.visualStyle}, and ${creativeProfile.motionDirection}.`,
    },
    {
      id: `${jobData.videoId}-fallback-2`,
      narration: `Show one clear value moment for ${extractedData.productName} and keep the viewer oriented.`,
      visualDirection: `Use ${creativeProfile.layouts[1]} framing with ${creativeProfile.palette}.`,
    },
    {
      id: `${jobData.videoId}-fallback-3`,
      narration: `${creativeProfile.endingDevice}. Keep the finish premium and decisive.`,
      visualDirection: `Use ${creativeProfile.layouts[2]} framing with a clean branded end card.`,
    },
  ];

  return {
    title: createVideoTitle(extractedData, creativeProfile.angle),
    tagline: `Auto-directed ${creativeProfile.angle.replace(/-/g, ' ')} cut`,
    script: beats.map((beat) => beat.narration).join(' '),
    beats,
    voiceoverText: `${extractedData.productName} is presented through an auto-directed ${creativeProfile.angle.replace(/-/g, ' ')} structure with a clearer opening, stronger proof, and a premium finish.`,
    subtitleLines: [extractedData.productName, 'Clear value fast', 'Premium finish'],
  };
}

function createVideoTitle(
  extractedData: ParsedPromptData,
  angle: ReturnType<typeof deriveCreativeProfile>['angle']
): string {
  return `${capitalizeWords(extractedData.productName)} ${capitalizeWords(angle.replace(/-/g, ' '))}`;
}

function capitalizeWords(value: string): string {
  return value
    .split(/\s+/)
    .filter((segment) => segment.length > 0)
    .map((segment) => `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`)
    .join(' ');
}

function simplifyLine(value: string): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized.length > 42 ? `${normalized.slice(0, 39).trimEnd()}...` : normalized;
}
