import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/auth-session';
import {
  createApiErrorResponse,
  createUnauthorizedApiErrorResponse,
  fetchApi,
  toProxyResponse,
} from '@/lib/server-api';

interface RouteContext {
  readonly params: Promise<{
    readonly id: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext): Promise<NextResponse> {
  const accessToken = await getSessionToken();

  if (!accessToken) {
    return createApiErrorResponse(401, 'Authentication is required.');
  }

  const { id } = await context.params;
  const response = await fetchApi({
    path: `/video/${id}`,
    method: 'GET',
    accessToken,
  });

  if (response.status === 401) {
    return createUnauthorizedApiErrorResponse();
  }

  return toProxyResponse(response, 'Failed to refresh video.');
}
