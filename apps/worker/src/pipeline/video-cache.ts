import { PrismaClient } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import {
  GeneratedImageAsset,
  OrchestratedVideoPlan,
  ParsedPromptData,
  SceneOutline,
  ScriptBeat,
  VideoGenerationJobData,
} from '@reevio/types';
import { z } from 'zod';
import { resolveLocalStoragePath } from '../storage/resolve-local-storage-path';

const parsedPromptSchema = z.object({
  rawPrompt: z.string().min(1),
  productName: z.string().min(1),
  audience: z.string().min(1),
  primaryGoal: z.string().min(1),
  highlights: z.array(z.string().min(1)),
});

const scriptBeatSchema = z.object({
  id: z.string().min(1),
  narration: z.string().min(1),
  visualDirection: z.string().min(1),
});

const sceneOutlineSchema = z.object({
  id: z.string().min(1),
  headline: z.string().min(1),
  narration: z.string().min(1),
  visualPrompt: z.string().min(1),
  durationInSeconds: z.number().positive(),
});

const imagePromptSchema = z.string().min(1);

const generatedImageAssetSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  url: z.string().url(),
  score: z.number(),
  provider: z.enum(['cloudflare', 'huggingface', 'pexels', 'pixabay']).default('pexels'),
  sourceKind: z.enum(['generated', 'stock']).default('stock'),
  fallbackDepth: z.number().int().nonnegative().default(0),
  attribution: z.string().min(1).optional(),
  searchQuery: z.string().min(1).optional(),
});

const videoCacheMetadataSchema = z.object({
  durationInSeconds: z.number().positive(),
  tagline: z.string().min(1),
  beats: z.array(scriptBeatSchema).min(1),
  voiceoverText: z.string().min(1),
  subtitleLines: z.array(z.string().min(1)).min(1),
});

export interface CachedVideoPipelineState {
  readonly parsedPrompt: ParsedPromptData;
  readonly orchestratedPlan: OrchestratedVideoPlan;
  readonly generatedAssets: GeneratedImageAsset[] | null;
  readonly voiceoverUrl: string | null;
  readonly subtitlesUrl: string | null;
}

export async function getCachedVideoPipelineState(
  prismaClient: PrismaClient,
  jobData: VideoGenerationJobData
): Promise<CachedVideoPipelineState | null> {
  const cachedVideo = await prismaClient.video.findFirst({
    where: {
      id: {
        not: jobData.videoId,
      },
      prompt: jobData.prompt,
      aspectRatio: jobData.aspectRatio,
      status: 'COMPLETED',
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      parsedPrompt: true,
      title: true,
      script: true,
      scenes: true,
      imagePrompts: true,
      assets: true,
      voiceoverUrl: true,
      subtitlesUrl: true,
      metadata: true,
    },
  });

  if (!cachedVideo) {
    return null;
  }

  const parsedPrompt = parsedPromptSchema.safeParse(cachedVideo.parsedPrompt);
  const metadata = videoCacheMetadataSchema.safeParse(cachedVideo.metadata);
  const scenes = z.array(sceneOutlineSchema).min(1).safeParse(cachedVideo.scenes);
  const imagePrompts = z.array(imagePromptSchema).min(1).safeParse(cachedVideo.imagePrompts);

  if (
    !parsedPrompt.success ||
    !metadata.success ||
    !scenes.success ||
    !imagePrompts.success ||
    imagePrompts.data.length !== scenes.data.length ||
    !cachedVideo.title ||
    !cachedVideo.script
  ) {
    return null;
  }

  const orchestratedPlan: OrchestratedVideoPlan = {
    title: cachedVideo.title,
    tagline: metadata.data.tagline,
    script: cachedVideo.script,
    beats: cloneScriptBeats(metadata.data.beats, jobData.videoId),
    scenes: cloneSceneOutlines(scenes.data, jobData.videoId),
    imagePrompts: imagePrompts.data,
    voiceoverText: metadata.data.voiceoverText,
    subtitleLines: metadata.data.subtitleLines,
    durationInSeconds: calculateDurationInSeconds(scenes.data),
  };

  const generatedAssets = toCachedGeneratedAssets(
    cachedVideo.assets,
    jobData.videoId,
    scenes.data.length
  );
  const [voiceoverUrl, subtitlesUrl] = await Promise.all([
    validateCachedArtifactUrl(cachedVideo.voiceoverUrl, isProbablyMp3File),
    validateCachedArtifactUrl(cachedVideo.subtitlesUrl, isProbablyVttFile),
  ]);

  return {
    parsedPrompt: parsedPrompt.data,
    orchestratedPlan,
    generatedAssets,
    voiceoverUrl,
    subtitlesUrl,
  };
}

function cloneScriptBeats(beats: ScriptBeat[], videoId: string): ScriptBeat[] {
  return beats.map((beat, index) => ({
    id: `${videoId}-cached-beat-${index + 1}`,
    narration: beat.narration,
    visualDirection: beat.visualDirection,
  }));
}

function cloneSceneOutlines(scenes: SceneOutline[], videoId: string): SceneOutline[] {
  return scenes.map((scene, index) => ({
    id: `${videoId}-cached-scene-${index + 1}`,
    headline: scene.headline,
    narration: scene.narration,
    visualPrompt: scene.visualPrompt,
    durationInSeconds: scene.durationInSeconds,
  }));
}

function toCachedGeneratedAssets(
  assets: unknown,
  videoId: string,
  expectedAssetCount: number
): GeneratedImageAsset[] | null {
  const parsedAssets = z.array(generatedImageAssetSchema).min(1).safeParse(assets);

  if (!parsedAssets.success || parsedAssets.data.length !== expectedAssetCount) {
    return null;
  }

  return parsedAssets.data.map((asset, index) => ({
    id: `${videoId}-cached-asset-${index + 1}`,
    prompt: asset.prompt,
    url: asset.url,
    score: asset.score,
    provider: asset.provider,
    sourceKind: asset.sourceKind,
    fallbackDepth: asset.fallbackDepth,
    attribution: asset.attribution,
    searchQuery: asset.searchQuery,
  }));
}

function calculateDurationInSeconds(scenes: SceneOutline[]): number {
  return scenes.reduce(
    (totalDurationInSeconds, scene) => totalDurationInSeconds + scene.durationInSeconds,
    0
  );
}

async function validateCachedArtifactUrl(
  artifactUrl: string | null,
  validator: (contents: Buffer) => boolean
): Promise<string | null> {
  if (!artifactUrl) {
    return null;
  }

  const localStoragePath = resolveLocalStoragePath(artifactUrl);

  if (!localStoragePath) {
    return artifactUrl;
  }

  try {
    const contents = await readFile(localStoragePath);
    return validator(contents) ? artifactUrl : null;
  } catch {
    return null;
  }
}

function isProbablyMp3File(contents: Buffer): boolean {
  if (contents.length < 3) {
    return false;
  }

  if (contents.subarray(0, 3).toString('ascii') === 'ID3') {
    return true;
  }

  const firstByte = contents[0] ?? -1;
  const secondByte = contents[1] ?? -1;

  return firstByte === 0xff && (secondByte & 0xe0) === 0xe0;
}

function isProbablyVttFile(contents: Buffer): boolean {
  return contents.subarray(0, 6).toString('utf8') === 'WEBVTT';
}
