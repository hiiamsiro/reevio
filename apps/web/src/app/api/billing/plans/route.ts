import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/auth-session';
import {
  createApiErrorResponse,
  createUnauthorizedApiErrorResponse,
  fetchApi,
  toProxyResponse,
} from '@/lib/server-api';

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
    return createUnauthorizedApiErrorResponse();
  }

  return toProxyResponse(response, 'Failed to load billing plans.');
}
