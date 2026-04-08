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
  STORAGE_DRIVER: z.enum(['local']).default('local'),
  STORAGE_PATH: z.string().default('./storage'),
  STORAGE_PUBLIC_BASE_URL: z.string().url().default('http://localhost:4000'),

  // Runtime
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // API URLs
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:4000'),

  // Auth
  AUTH_SECRET: z.string().min(1).default('change-me-in-production'),
  AUTH_URL: z.string().url().default('http://localhost:3000'),

  // Default provider
  VIDEO_PROVIDER: videoProviderSchema.default('remotion'),

  // Provider API Keys
  REMOTION_LICENSE_KEY: z.string().optional(),
  TOPVIEW_API_KEY: z.string().optional(),
  GROK_API_KEY: z.string().optional(),
  GOOGLE_FLOW_API_KEY: z.string().optional(),
  VEO_API_KEY: z.string().optional(),

  // Webhooks
  WEBHOOK_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
