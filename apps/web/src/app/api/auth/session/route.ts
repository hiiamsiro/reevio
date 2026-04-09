import { NextResponse } from 'next/server';
import { ApiResponse, User } from '@reevio/types';
import { clearSessionCookie, getSessionToken } from '@/lib/auth-session';
import { createApiErrorResponse, fetchApi, toProxyResponse } from '@/lib/server-api';

export async function GET(): Promise<NextResponse> {
  const accessToken = await getSessionToken();

  if (!accessToken) {
    return createApiErrorResponse(401, 'Authentication is required.');
  }

  const response = await fetchApi({
    path: '/auth/session',
    method: 'GET',
    accessToken,
  });

  if (response.status === 401) {
    const nextResponse = NextResponse.json<ApiResponse<User>>({
      success: false,
      data: null,
      error: 'Authentication is required.',
    }, {
      status: 401,
    });

    clearSessionCookie(nextResponse);

    return nextResponse;
  }

  return toProxyResponse(response, 'Failed to load current session.');
}
