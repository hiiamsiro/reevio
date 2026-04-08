import { Prisma, PrismaClient } from '@prisma/client';
import {
  BuiltScene,
  GeneratedImageAsset,
  OrchestratedVideoPlan,
  ParsedPromptData,
  VideoGenerationJobData,
  VideoGenerationResult,
} from '@reevio/types';
import { createAiOrchestration } from '../ai-orchestrator/create-ai-orchestration';
import { extractData } from '../ai-orchestrator/extract-data';
import { createImageAssets } from '../image-pipeline/create-image-assets';
import { createProviderFactory } from '../providers/create-provider-factory';

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
    const parsedPrompt = await extractData(jobData.prompt);

    await updateJobStep(prismaClient, persistedJob.id, 'AI_ORCHESTRATION');
    const orchestratedPlan = await createOrchestratedPlan(parsedPrompt, jobData);

    await updateJobStep(prismaClient, persistedJob.id, 'GENERATE_IMAGES');
    const generatedAssets = createImageAssets(orchestratedPlan.imagePrompts, jobData.videoId);

    await updateJobStep(prismaClient, persistedJob.id, 'BUILD_SCENES');
    const builtScenes = buildScenes(orchestratedPlan, generatedAssets);

    await updateJobStep(prismaClient, persistedJob.id, 'GENERATE_VIDEO');
    const videoResult = await generateVideoResult(jobData, orchestratedPlan, builtScenes);

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

async function createOrchestratedPlan(
  parsedPrompt: ParsedPromptData,
  jobData: VideoGenerationJobData
): Promise<OrchestratedVideoPlan> {
  return createAiOrchestration(parsedPrompt, jobData);
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
): Promise<VideoGenerationResult> {
  const providerFactory = createProviderFactory();
  const provider = providerFactory.getProvider(jobData.provider);

  return provider.generateVideo({
    videoId: jobData.videoId,
    aspectRatio: jobData.aspectRatio,
    orchestratedPlan,
    builtScenes,
  });
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
        queueVersion: 'phase-7',
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
