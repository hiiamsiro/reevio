import { z } from 'zod';

export const videoProviderSchema = z.enum(['remotion', 'topview', 'grok', 'flow', 'veo']);

export const videoRenderParamsSchema = z.object({
  script: z.string().optional(),
  assets: z
    .array(
      z.object({
        type: z.enum(['image', 'video', 'audio']),
        url: z.string().url(),
        startTime: z.number().optional(),
        duration: z.number().optional(),
        position: z.object({ x: z.number(), y: z.number() }).optional(),
        size: z.object({ width: z.number(), height: z.number() }).optional(),
      })
    )
    .optional(),
  style: z.string().optional(),
  duration: z.number().optional(),
  resolution: z.enum(['720p', '1080p', '4k']).optional(),
  aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:5']).optional(),
  voiceoverUrl: z.string().url().optional(),
  backgroundMusicUrl: z.string().url().optional(),
});

export const videoRenderRequestSchema = z.object({
  projectId: z.string().uuid(),
  templateId: z.string(),
  provider: videoProviderSchema,
  params: videoRenderParamsSchema,
  webhookUrl: z.string().url().optional(),
});

export const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),

  // Queue
  REDIS_URL: z.string().min(1),

  // Storage
  STORAGE_PATH: z.string().default('./storage'),

  // Default provider
  VIDEO_PROVIDER: videoProviderSchema.default('remotion'),

  // Provider API Keys
  TOPVIEW_API_KEY: z.string().optional(),
  GROK_API_KEY: z.string().optional(),
  GOOGLE_FLOW_API_KEY: z.string().optional(),
  VEO_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
