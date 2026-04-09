import { NextResponse } from 'next/server';
import { ApiResponse } from '@reevio/types';
import { clearSessionCookie, getSessionToken } from '@/lib/auth-session';
import { createApiErrorResponse, fetchApi, readJsonBody, toProxyResponse } from '@/lib/server-api';

export async function POST(request: Request): Promise<NextResponse> {
  const accessToken = await getSessionToken();

  if (!accessToken) {
    return createApiErrorResponse(401, 'Authentication is required.');
  }

  const body = await readJsonBody(request);

  if (body === null) {
    return createApiErrorResponse(400, 'Request body must be valid JSON.');
  }

  const response = await fetchApi({
    path: '/generate-video',
    method: 'POST',
    accessToken,
    body,
  });

  if (response.status === 401) {
    const nextResponse = createApiErrorResponse(401, 'Authentication is required.');

    clearSessionCookie(nextResponse);

    return nextResponse;
  }

  return toProxyResponse(response, 'Failed to generate video.');
}
