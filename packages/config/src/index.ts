import { z } from 'zod';

const optionalNonEmptyString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().min(1).optional()
);

export const videoProviderSchema = z.enum(['remotion']);

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

  // Image providers
  IMAGE_PROVIDER_ORDER: z
    .string()
    .default('cloudflare,huggingface,pexels,pixabay'),
  CF_ACCOUNT_ID: optionalNonEmptyString,
  CF_API_TOKEN: optionalNonEmptyString,
  CF_IMAGE_MODEL: z
    .string()
    .default('@cf/black-forest-labs/flux-1-schnell'),
  HF_API_KEY: optionalNonEmptyString,
  HF_IMAGE_MODEL: z
    .string()
    .default('black-forest-labs/FLUX.1-schnell'),
  PEXELS_API_KEY: optionalNonEmptyString,
  PIXABAY_API_KEY: optionalNonEmptyString,
  IMAGE_PROVIDER_TIMEOUT_MS: z.coerce.number().int().positive().default(25000),
  IMAGE_PROVIDER_COOLDOWN_SECONDS: z.coerce.number().int().positive().default(300),

  // Edge TTS
  EDGE_TTS_VOICE: optionalNonEmptyString,
  EDGE_TTS_LANG: z.string().min(1).default('vi-VN'),
  EDGE_TTS_OUTPUT_FORMAT: z
    .string()
    .default('audio-24khz-48kbitrate-mono-mp3'),
  EDGE_TTS_RATE: z.string().default('default'),
  EDGE_TTS_PITCH: z.string().default('default'),
  EDGE_TTS_VOLUME: z.string().default('default'),
  EDGE_TTS_PROXY: optionalNonEmptyString,
  EDGE_TTS_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
});

export type Env = z.infer<typeof envSchema>;
