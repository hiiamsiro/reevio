import { NextResponse } from 'next/server';
import { ApiResponse } from '@reevio/types';
import { clearSessionCookie } from '@/lib/auth-session';

const API_BASE_URL = process.env.API_URL ?? 'http://localhost:4000';

interface ApiRequestOptions {
  readonly path: string;
  readonly method: 'GET' | 'POST';
  readonly accessToken?: string;
  readonly body?: unknown;
}

export async function fetchApi(options: ApiRequestOptions): Promise<Response> {
  const headers = new Headers();

  headers.set('accept', 'application/json');

  if (options.body !== undefined) {
    headers.set('content-type', 'application/json');
  }

  if (options.accessToken) {
    headers.set('authorization', `Bearer ${options.accessToken}`);
  }

  return fetch(`${API_BASE_URL}${options.path}`, {
    method: options.method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: 'no-store',
  });
}

export function createApiErrorResponse<T = unknown>(
  status: number,
  error: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json<ApiResponse<T>>({
    success: false,
    data: null,
    error,
  }, {
    status,
  });
}

export function createUnauthorizedApiErrorResponse<T = unknown>(): NextResponse<ApiResponse<T>> {
  const response = createApiErrorResponse<T>(401, 'Authentication is required.');

  clearSessionCookie(response);

  return response;
}

export async function toProxyResponse(response: Response, fallbackError: string): Promise<NextResponse> {
  const payload = await readResponsePayload(response);

  if (response.ok) {
    return NextResponse.json(payload, {
      status: response.status,
    });
  }

  return NextResponse.json<ApiResponse>({
    success: false,
    data: null,
    error: getErrorMessage(payload, fallbackError),
  }, {
    status: response.status,
  });
}

export async function readResponsePayload(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function readJsonBody(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function getErrorMessage(payload: unknown, fallbackError: string): string {
  if (!payload || typeof payload !== 'object') {
    return fallbackError;
  }

  if ('error' in payload && typeof payload.error === 'string' && payload.error.length > 0) {
    return payload.error;
  }

  if ('message' in payload && typeof payload.message === 'string' && payload.message.length > 0) {
    return payload.message;
  }

  return fallbackError;
}
