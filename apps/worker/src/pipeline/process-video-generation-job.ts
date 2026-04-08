import { Prisma, PrismaClient } from '@prisma/client';
import {
  BuiltScene,
  GeneratedImageAsset,
  OrchestratedVideoPlan,
  ParsedPromptData,
  VideoGenerationJobData,
  VideoGenerationResult,
} from '@reevio/types';

interface PersistedJobWithVideo {
  readonly id: string;
  readonly userId: string;
  readonly videoId: string;
  readonly provider: 'REMOTION' | 'TOPVIEW' | 'GROK' | 'FLOW' | 'VEO';
  readonly status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  readonly step:
    | 'PARSE_PROMPT'
    | 'AI_ORCHESTRATION'
    | 'GENERATE_IMAGES'
    | 'BUILD_SCENES'
    | 'GENERATE_VIDEO'
    | 'SAVE_RESULT';
  readonly attempts: number;
  readonly video: {
    readonly id: string;
    readonly prompt: string;
    readonly aspectRatio: string;
    readonly provider: 'REMOTION' | 'TOPVIEW' | 'GROK' | 'FLOW' | 'VEO';
  };
}

export async function processVideoGenerationJob(
  prismaClient: PrismaClient,
  jobData: VideoGenerationJobData
): Promise<void> {
  const persistedJob = await prismaClient.job.findUnique({
    where: {
      id: jobData.jobId,
    },
    include: {
      video: true,
    },
  });

  if (!persistedJob) {
    throw new PipelineJobNotFoundError(jobData.jobId);
  }

  await prismaClient.video.update({
    where: {
      id: persistedJob.videoId,
    },
    data: {
      status: 'PROCESSING',
    },
  });

  await prismaClient.job.update({
    where: {
      id: persistedJob.id,
    },
    data: {
      status: 'PROCESSING',
      step: 'PARSE_PROMPT',
      startedAt: new Date(),
      attempts: {
        increment: 1,
      },
    },
  });

  try {
    const parsedPrompt = parsePrompt(persistedJob.video.prompt);

    await updateJobStep(prismaClient, persistedJob.id, 'AI_ORCHESTRATION');
    const orchestratedPlan = orchestrateVideoPlan(parsedPrompt, jobData);

    await updateJobStep(prismaClient, persistedJob.id, 'GENERATE_IMAGES');
    const generatedAssets = generateImageAssets(orchestratedPlan, jobData.videoId);

    await updateJobStep(prismaClient, persistedJob.id, 'BUILD_SCENES');
    const builtScenes = buildScenes(orchestratedPlan, generatedAssets);

    await updateJobStep(prismaClient, persistedJob.id, 'GENERATE_VIDEO');
    const videoResult = generateVideoResult(jobData, orchestratedPlan, builtScenes);

    await updateJobStep(prismaClient, persistedJob.id, 'SAVE_RESULT');
    await savePipelineResult(
      prismaClient,
      persistedJob,
      parsedPrompt,
      orchestratedPlan,
      generatedAssets,
      builtScenes,
      videoResult
    );
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);

    await prismaClient.job.update({
      where: {
        id: persistedJob.id,
      },
      data: {
        status: 'FAILED',
        errorCode: 'PIPELINE_FAILED',
        errorMessage,
      },
    });

    await prismaClient.video.update({
      where: {
        id: persistedJob.videoId,
      },
      data: {
        status: 'FAILED',
        errorCode: 'PIPELINE_FAILED',
        errorMessage,
      },
    });

    throw error;
  }
}

function parsePrompt(prompt: string): ParsedPromptData {
  const normalizedPrompt = prompt.trim();
  const promptWords = normalizedPrompt.split(/\s+/).filter((word) => word.length > 0);

  if (promptWords.length === 0) {
    throw new Error('Cannot process an empty video prompt.');
  }

  const productName = promptWords.slice(0, 4).join(' ');
  const highlights = promptWords.slice(0, 8).map((word) => word.replace(/[^\w-]/g, ''));

  return {
    rawPrompt: normalizedPrompt,
    productName,
    audience: 'affiliate shoppers',
    primaryGoal: 'drive clicks and conversions',
    highlights,
  };
}

function orchestrateVideoPlan(
  parsedPrompt: ParsedPromptData,
  jobData: VideoGenerationJobData
): OrchestratedVideoPlan {
  const title = `${parsedPrompt.productName} promo`;
  const tagline = `Fast ${jobData.provider} video for ${parsedPrompt.audience}`;
  const subtitleLines = [
    `Meet ${parsedPrompt.productName}`,
    'Show the benefit fast',
    'End with a clear call to action',
  ];

  return {
    title,
    tagline,
    script: [
      `Hook the viewer with ${parsedPrompt.productName}.`,
      'Show the main value prop in one sentence.',
      'Finish with urgency and a direct call to action.',
    ].join(' '),
    beats: [
      {
        id: `${jobData.videoId}-beat-1`,
        narration: `This is why ${parsedPrompt.productName} stands out.`,
        visualDirection: 'Punchy opening with product close-up.',
      },
      {
        id: `${jobData.videoId}-beat-2`,
        narration: 'Highlight the strongest customer benefit in plain language.',
        visualDirection: 'Feature showcase with bold text overlays.',
      },
      {
        id: `${jobData.videoId}-beat-3`,
        narration: 'Close with confidence and a simple CTA.',
        visualDirection: 'Brand reveal with offer and CTA card.',
      },
    ],
    scenes: [
      {
        id: `${jobData.videoId}-scene-1`,
        headline: `Discover ${parsedPrompt.productName}`,
        narration: `Meet ${parsedPrompt.productName} and see why it gets attention fast.`,
        visualPrompt: `High-energy hero shot for ${parsedPrompt.productName} in ${jobData.aspectRatio}`,
        durationInSeconds: 4,
      },
      {
        id: `${jobData.videoId}-scene-2`,
        headline: 'Show the payoff',
        narration: 'Focus on the clearest transformation or value for the viewer.',
        visualPrompt: `Lifestyle product showcase with affiliate-style callouts for ${parsedPrompt.productName}`,
        durationInSeconds: 5,
      },
      {
        id: `${jobData.videoId}-scene-3`,
        headline: 'Close the sale',
        narration: 'End with urgency, trust, and a direct call to click now.',
        visualPrompt: `Call-to-action end card for ${parsedPrompt.productName}`,
        durationInSeconds: 3,
      },
    ],
    imagePrompts: [
      `Hero image for ${parsedPrompt.productName}`,
      `Feature showcase for ${parsedPrompt.productName}`,
      `CTA card for ${parsedPrompt.productName}`,
    ],
    voiceoverText: `Meet ${parsedPrompt.productName}. See the value fast and click through for the full offer.`,
    subtitleLines,
    durationInSeconds: 12,
  };
}

function generateImageAssets(
  orchestratedPlan: OrchestratedVideoPlan,
  videoId: string
): GeneratedImageAsset[] {
  return orchestratedPlan.imagePrompts.map((prompt, index) => ({
    id: `${videoId}-asset-${index + 1}`,
    prompt,
    url: `storage://generated/images/${videoId}/image-${index + 1}.png`,
    score: 0.9 - index * 0.1,
  }));
}

function buildScenes(
  orchestratedPlan: OrchestratedVideoPlan,
  generatedAssets: GeneratedImageAsset[]
): BuiltScene[] {
  return orchestratedPlan.scenes.map((scene, index) => {
    const asset = generatedAssets[index];

    if (!asset) {
      throw new Error(`Missing generated asset for scene "${scene.id}".`);
    }

    return {
      id: scene.id,
      headline: scene.headline,
      narration: scene.narration,
      visualPrompt: scene.visualPrompt,
      assetUrl: asset.url,
      durationInSeconds: scene.durationInSeconds,
    };
  });
}

function generateVideoResult(
  jobData: VideoGenerationJobData,
  orchestratedPlan: OrchestratedVideoPlan,
  builtScenes: BuiltScene[]
): VideoGenerationResult {
  const outputUrl = `storage://generated/videos/${jobData.videoId}.mp4`;

  return {
    provider: jobData.provider,
    url: outputUrl,
    previewUrl: outputUrl,
    durationInSeconds:
      builtScenes.reduce((total, scene) => total + scene.durationInSeconds, 0) ||
      orchestratedPlan.durationInSeconds,
  };
}

async function savePipelineResult(
  prismaClient: PrismaClient,
  persistedJob: PersistedJobWithVideo,
  parsedPrompt: ParsedPromptData,
  orchestratedPlan: OrchestratedVideoPlan,
  generatedAssets: GeneratedImageAsset[],
  builtScenes: BuiltScene[],
  videoResult: VideoGenerationResult
): Promise<void> {
  await prismaClient.video.update({
    where: {
      id: persistedJob.videoId,
    },
    data: {
      status: 'COMPLETED',
      title: orchestratedPlan.title,
      script: orchestratedPlan.script,
      parsedPrompt: parsedPrompt as unknown as Prisma.InputJsonValue,
      scenes: builtScenes as unknown as Prisma.InputJsonValue,
      imagePrompts: orchestratedPlan.imagePrompts as unknown as Prisma.InputJsonValue,
      assets: generatedAssets as unknown as Prisma.InputJsonValue,
      outputUrl: videoResult.url,
      previewUrl: videoResult.previewUrl,
      completedAt: new Date(),
      metadata: {
        durationInSeconds: videoResult.durationInSeconds,
        queueVersion: 'phase-6',
      } as Prisma.InputJsonValue,
    },
  });

  await prismaClient.job.update({
    where: {
      id: persistedJob.id,
    },
    data: {
      status: 'COMPLETED',
      resultUrl: videoResult.url,
      completedAt: new Date(),
    },
  });
}

async function updateJobStep(
  prismaClient: PrismaClient,
  jobId: string,
  step:
    | 'AI_ORCHESTRATION'
    | 'GENERATE_IMAGES'
    | 'BUILD_SCENES'
    | 'GENERATE_VIDEO'
    | 'SAVE_RESULT'
): Promise<void> {
  await prismaClient.job.update({
    where: {
      id: jobId,
    },
    data: {
      step,
    },
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown worker pipeline error';
}

class PipelineJobNotFoundError extends Error {
  public readonly code: string;

  public constructor(jobId: string) {
    super(`Worker could not find job "${jobId}".`);
    this.name = 'PipelineJobNotFoundError';
    this.code = 'PIPELINE_JOB_NOT_FOUND';
  }
}
