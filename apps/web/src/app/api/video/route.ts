import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/auth-session';
import {
  createApiErrorResponse,
  createUnauthorizedApiErrorResponse,
  fetchApi,
  readJsonBody,
  toProxyResponse,
} from '@/lib/server-api';

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
    return createUnauthorizedApiErrorResponse();
  }

  return toProxyResponse(response, 'Failed to generate video.');
}
