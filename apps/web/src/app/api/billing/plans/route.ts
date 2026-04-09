import { NextResponse } from 'next/server';
import { clearSessionCookie, getSessionToken } from '@/lib/auth-session';
import { createApiErrorResponse, fetchApi, toProxyResponse } from '@/lib/server-api';

export async function GET(): Promise<NextResponse> {
  const accessToken = await getSessionToken();

  if (!accessToken) {
    return createApiErrorResponse(401, 'Authentication is required.');
  }

  const response = await fetchApi({
    path: '/billing/plans',
    method: 'GET',
    accessToken,
  });

  if (response.status === 401) {
    const nextResponse = createApiErrorResponse(401, 'Authentication is required.');

    clearSessionCookie(nextResponse);

    return nextResponse;
  }

  return toProxyResponse(response, 'Failed to load billing plans.');
}
