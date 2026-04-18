import type { ApiResponse } from '@reevio/types';
import type { Dispatch, SetStateAction } from 'react';
import type {
  AppRouter,
  CurrentUser,
  FetchResourceInput,
  GenerateVideoResponse,
  GenerateVideoRequestInput,
  ProviderDefinition,
  SubmitVideoRequestInput,
  VideoResponse,
} from './page.types';

export async function loadCurrentUser(router: AppRouter): Promise<CurrentUser | null> {
  return fetchResource<CurrentUser>({
    path: '/api/auth/session',
    router,
    fallbackError: 'Failed to load session.',
  });
}

export async function loadProviders(router: AppRouter): Promise<ProviderDefinition[] | null> {
  return fetchResource<ProviderDefinition[]>({
    path: '/api/providers',
    router,
    fallbackError: 'Failed to load providers.',
  });
}

export async function loadVideo(
  videoId: string,
  router: AppRouter,
  fallbackError: string
): Promise<VideoResponse | null> {
  return fetchResource<VideoResponse>({
    path: `/api/video/${videoId}`,
    router,
    fallbackError,
  });
}

export async function loadVideoQueue(
  router: AppRouter,
  fallbackError: string
): Promise<VideoResponse[] | null> {
  return fetchResource<VideoResponse[]>({
    path: '/api/video',
    router,
    fallbackError,
  });
}

export async function refreshCurrentUser(
  setCurrentUser: Dispatch<SetStateAction<CurrentUser | null>>
): Promise<void> {
  const currentUser = await fetchOptionalResource<CurrentUser>('/api/auth/session');

  if (currentUser) {
    setCurrentUser(currentUser);
  }
}

export async function requestVideoGeneration(
  input: GenerateVideoRequestInput
): Promise<GenerateVideoResponse> {
  const response = await fetch('/api/video', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      prompt: input.prompt,
      provider: input.provider,
      aspectRatio: input.aspectRatio,
    }),
  });
  const payload = (await response.json()) as ApiResponse<GenerateVideoResponse>;

  if (response.status === 401) {
    redirectToLogin(input.router);
    throw new Error('Authentication is required.');
  }

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? input.fallbackError);
  }

  return payload.data;
}

export async function submitVideoRequest(input: SubmitVideoRequestInput): Promise<void> {
  try {
    const result = await requestVideoGeneration({
      prompt: input.promptToSend,
      provider: input.provider,
      aspectRatio: input.aspectRatio,
      router: input.router,
      fallbackError: 'Failed to generate video.',
    });

    input.setVideo(result.video);
    input.setCurrentUser((previousUser) => {
      if (!previousUser) {
        return previousUser;
      }

      return {
        ...previousUser,
        credits: result.remainingCredits,
      };
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      input.setErrorMessage(error.message);
      return;
    }

    input.setErrorMessage('Failed to generate video.');
  }
}

async function fetchResource<T>(input: FetchResourceInput): Promise<T | null> {
  const response = await fetch(input.path, {
    cache: 'no-store',
  });
  const payload = (await response.json()) as ApiResponse<T>;

  if (response.status === 401) {
    redirectToLogin(input.router);
    return null;
  }

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? input.fallbackError);
  }

  return payload.data;
}

async function fetchOptionalResource<T>(path: string): Promise<T | null> {
  const response = await fetch(path, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as ApiResponse<T>;

  if (!payload.success || !payload.data) {
    return null;
  }

  return payload.data;
}

function redirectToLogin(router: AppRouter): void {
  router.push('/login');
  router.refresh();
}
