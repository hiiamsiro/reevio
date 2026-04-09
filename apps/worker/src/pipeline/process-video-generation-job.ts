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
import { createStorageService } from '../storage/storage.factory';
import { getCachedVideoPipelineState } from './video-cache';
import { generateSubtitles } from '../voice/generate-subtitles';
import { generateTtsTrack } from '../voice/generate-tts';

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
  jobData: VideoGenerationJobData,
  attemptsMade: number,
  maxAttempts: number
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
      errorCode: null,
      errorMessage: null,
    },
  });

  await prismaClient.job.update({
    where: {
      id: persistedJob.id,
    },
    data: {
      status: 'PROCESSING',
      step: 'PARSE_PROMPT',
      errorCode: null,
      errorMessage: null,
      startedAt: new Date(),
      attempts: {
        increment: 1,
      },
    },
  });

  try {
    const storageService = createStorageService();
    const cachedVideoPipelineState = await getCachedVideoPipelineState(prismaClient, jobData);
    const parsedPrompt = cachedVideoPipelineState?.parsedPrompt ?? (await extractData(jobData.prompt));

    await updateJobStep(prismaClient, persistedJob.id, 'AI_ORCHESTRATION');
    const orchestratedPlan =
      cachedVideoPipelineState?.orchestratedPlan ??
      (await createOrchestratedPlan(parsedPrompt, jobData));
    const providerFactory = createProviderFactory();
    const voiceoverUrl =
      cachedVideoPipelineState?.voiceoverUrl ??
      (await generateTtsTrack(jobData.videoId, orchestratedPlan.voiceoverText, storageService));
    const subtitlesUrl =
      cachedVideoPipelineState?.subtitlesUrl ??
      (await generateSubtitles(jobData.videoId, orchestratedPlan.subtitleLines, storageService));

    await updateJobStep(prismaClient, persistedJob.id, 'GENERATE_IMAGES');
    const generatedAssets =
      cachedVideoPipelineState?.generatedAssets ??
      (await createImageAssets(orchestratedPlan.imagePrompts, jobData.videoId, storageService));

    await updateJobStep(prismaClient, persistedJob.id, 'BUILD_SCENES');
    const builtScenes = buildScenes(orchestratedPlan, generatedAssets);

    await updateJobStep(prismaClient, persistedJob.id, 'GENERATE_VIDEO');
    const videoResult = await generateVideoResult(providerFactory, jobData, orchestratedPlan, builtScenes, voiceoverUrl, subtitlesUrl);
    await storageService.compressJsonArtifact(videoResult.url);

    await updateJobStep(prismaClient, persistedJob.id, 'SAVE_RESULT');
    await savePipelineResult(
      prismaClient,
      persistedJob,
      parsedPrompt,
      orchestratedPlan,
      generatedAssets,
      builtScenes,
      voiceoverUrl,
      subtitlesUrl,
      videoResult
    );
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    const isFinalAttempt = attemptsMade + 1 >= maxAttempts;

    await handlePipelineFailure(prismaClient, persistedJob, errorMessage, isFinalAttempt);

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
  providerFactory: ReturnType<typeof createProviderFactory>,
  jobData: VideoGenerationJobData,
  orchestratedPlan: OrchestratedVideoPlan,
  builtScenes: BuiltScene[],
  voiceoverUrl: string,
  subtitlesUrl: string
): Promise<VideoGenerationResult> {
  return providerFactory.generateVideo(jobData.provider, {
    videoId: jobData.videoId,
    aspectRatio: jobData.aspectRatio,
    orchestratedPlan,
    builtScenes,
    voiceoverUrl,
    subtitlesUrl,
  });
}

async function savePipelineResult(
  prismaClient: PrismaClient,
  persistedJob: PersistedJobWithVideo,
  parsedPrompt: ParsedPromptData,
  orchestratedPlan: OrchestratedVideoPlan,
  generatedAssets: GeneratedImageAsset[],
  builtScenes: BuiltScene[],
  voiceoverUrl: string,
  subtitlesUrl: string,
  videoResult: VideoGenerationResult
): Promise<void> {
  const videoMetadata = {
    durationInSeconds: videoResult.durationInSeconds,
    tagline: orchestratedPlan.tagline,
    beats: orchestratedPlan.beats,
    voiceoverText: orchestratedPlan.voiceoverText,
    subtitleLines: orchestratedPlan.subtitleLines,
    queueVersion: 'phase-18',
  } as unknown as Prisma.InputJsonValue;

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
      voiceoverUrl,
      subtitlesUrl,
      completedAt: new Date(),
      metadata: videoMetadata,
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

async function handlePipelineFailure(
  prismaClient: PrismaClient,
  persistedJob: PersistedJobWithVideo,
  errorMessage: string,
  isFinalAttempt: boolean
): Promise<void> {
  if (!isFinalAttempt) {
    await prismaClient.job.update({
      where: {
        id: persistedJob.id,
      },
      data: {
        status: 'QUEUED',
        errorCode: 'PIPELINE_RETRYING',
        errorMessage,
      },
    });

    await prismaClient.video.update({
      where: {
        id: persistedJob.videoId,
      },
      data: {
        status: 'QUEUED',
        errorCode: 'PIPELINE_RETRYING',
        errorMessage,
      },
    });

    return;
  }

  await prismaClient.$transaction(async (transactionClient) => {
    const videoRecord = await transactionClient.video.findUnique({
      where: {
        id: persistedJob.videoId,
      },
      select: {
        creditCost: true,
        creditRefundedAt: true,
      },
    });

    if (!videoRecord) {
      throw new Error(`Video "${persistedJob.videoId}" was not found while refunding credits.`);
    }

    if (!videoRecord.creditRefundedAt && videoRecord.creditCost > 0) {
      await transactionClient.user.update({
        where: {
          id: persistedJob.userId,
        },
        data: {
          credits: {
            increment: videoRecord.creditCost,
          },
        },
      });
    }

    await transactionClient.job.update({
      where: {
        id: persistedJob.id,
      },
      data: {
        status: 'FAILED',
        errorCode: 'PIPELINE_FAILED',
        errorMessage,
      },
    });

    await transactionClient.video.update({
      where: {
        id: persistedJob.videoId,
      },
      data: {
        status: 'FAILED',
        errorCode: 'PIPELINE_FAILED',
        errorMessage,
        creditRefundedAt: videoRecord.creditRefundedAt ?? new Date(),
      },
    });
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
