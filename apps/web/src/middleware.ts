import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth-session';

const AUTH_ROUTES = new Set(['/login', '/register']);
const PROTECTED_ROUTES = ['/create-video', '/pricing'];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    return NextResponse.next();
  }

  // Middleware is only used for lightweight UX gating.
  // Real authentication is still validated by the API/session endpoints.
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (AUTH_ROUTES.has(pathname) && hasSessionCookie) {
    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = '/create-video';

    return NextResponse.redirect(nextUrl);
  }

  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !hasSessionCookie) {
    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = '/login';

    return NextResponse.redirect(nextUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/create-video/:path*'],
};
