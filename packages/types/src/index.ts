// ─── Video Providers ─────────────────────────────────────────────────────────

export type VideoProvider = 'remotion' | 'topview' | 'grok' | 'flow' | 'veo';

export interface VideoProviderConfig {
  provider: VideoProvider;
  apiKey: string;
  baseUrl?: string;
}

export interface VideoRenderRequest {
  projectId: string;
  templateId: string;
  provider: VideoProvider;
  params: VideoRenderParams;
  webhookUrl?: string;
}

export interface VideoRenderParams {
  script?: string;
  assets?: AssetInput[];
  style?: string;
  duration?: number;
  resolution?: '720p' | '1080p' | '4k';
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:5';
  voiceoverUrl?: string;
  backgroundMusicUrl?: string;
}

export interface AssetInput {
  type: 'image' | 'video' | 'audio';
  url: string;
  startTime?: number;
  duration?: number;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface VideoRenderStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  provider: VideoProvider;
  progress?: number;
  outputUrl?: string;
  error?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export type ProjectStatus = 'draft' | 'processing' | 'completed' | 'failed';

export interface Project {
  id: string;
  userId: string;
  name: string;
  status: ProjectStatus;
  provider: VideoProvider;
  templateId: string;
  renderParams: VideoRenderParams;
  outputUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  error?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name?: string;
  plan: UserPlan;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export type UserPlan = 'free' | 'starter' | 'pro' | 'enterprise';

// ─── API Primitives ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta?: ApiMeta;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta: Required<ApiMeta>;
}

// ─── Queue Jobs ────────────────────────────────────────────────────────────────

export interface RenderJob {
  id: string;
  projectId: string;
  provider: VideoProvider;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  scheduledAt?: string;
}
