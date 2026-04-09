import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const SESSION_COOKIE_NAME = 'reevio_session';
export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12;

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export function setSessionCookie(response: NextResponse, accessToken: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}
