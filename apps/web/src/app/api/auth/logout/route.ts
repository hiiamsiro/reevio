import { NextResponse } from 'next/server';
import { ApiResponse } from '@reevio/types';
import { clearSessionCookie } from '@/lib/auth-session';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json<ApiResponse>({
    success: true,
    data: null,
    error: null,
  });

  clearSessionCookie(response);

  return response;
}
