import { NextResponse } from 'next/server';
import { AuthSession, ApiResponse } from '@reevio/types';
import { setSessionCookie } from '@/lib/auth-session';
import { createApiErrorResponse, fetchApi, readJsonBody, readResponsePayload } from '@/lib/server-api';

interface BrowserAuthSession {
  readonly user: AuthSession['user'];
  readonly expiresAt: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readJsonBody(request);

  if (body === null) {
    return createApiErrorResponse(400, 'Request body must be valid JSON.');
  }

  const response = await fetchApi({
    path: '/auth/login',
    method: 'POST',
    body,
  });
  const payload = (await readResponsePayload(response)) as ApiResponse<AuthSession> | null;

  if (!response.ok || !payload?.success || !payload.data) {
    return createApiErrorResponse(response.status, payload?.error ?? 'Login failed.');
  }

  const nextResponse = NextResponse.json<ApiResponse<BrowserAuthSession>>({
    success: true,
    data: {
      user: payload.data.user,
      expiresAt: payload.data.expiresAt,
    },
    error: null,
  });

  setSessionCookie(nextResponse, payload.data.accessToken);

  return nextResponse;
}
