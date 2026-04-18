import { z } from 'zod';
import { VIDEO_ASPECT_RATIO_VALUES } from './video.constants';
import { CREATABLE_VIDEO_PROVIDER_VALUES } from '../provider/provider.constants';

export const generateVideoRequestSchema = z.object({
  prompt: z.string().min(12),
  provider: z.enum(CREATABLE_VIDEO_PROVIDER_VALUES),
  aspectRatio: z.enum(VIDEO_ASPECT_RATIO_VALUES),
});

export const videoIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type GenerateVideoRequest = z.infer<typeof generateVideoRequestSchema>;
