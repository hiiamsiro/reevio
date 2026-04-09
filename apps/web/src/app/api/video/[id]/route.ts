import { NextResponse } from 'next/server';
import { ApiResponse } from '@reevio/types';
import { clearSessionCookie, getSessionToken } from '@/lib/auth-session';
import { createApiErrorResponse, fetchApi, toProxyResponse } from '@/lib/server-api';

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
    const nextResponse = createApiErrorResponse(401, 'Authentication is required.');

    clearSessionCookie(nextResponse);

    return nextResponse;
  }

  return toProxyResponse(response, 'Failed to refresh video.');
}
