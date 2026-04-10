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

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const hasValidSession = await isSessionTokenActive(sessionToken);

  if (AUTH_ROUTES.has(pathname) && hasValidSession) {
    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = '/create-video';

    return NextResponse.redirect(nextUrl);
  }

  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !hasValidSession) {
    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = '/login';

    return NextResponse.redirect(nextUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/create-video/:path*'],
};

async function isSessionTokenActive(sessionToken: string | undefined): Promise<boolean> {
  if (!sessionToken) {
    return false;
  }

  const tokenParts = sessionToken.split('.');

  if (tokenParts.length !== 3) {
    return false;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = tokenParts;
  const header = toJwtSegment(encodedHeader);
  const payload = toJwtSegment(encodedPayload);

  if (!header || !payload || header.alg !== 'HS256' || typeof payload.exp !== 'number') {
    return false;
  }

  if (payload.exp * 1000 <= Date.now()) {
    return false;
  }

  const authSecret = process.env.AUTH_SECRET;

  if (!authSecret) {
    return false;
  }

  return verifyJwtSignature(encodedHeader, encodedPayload, encodedSignature, authSecret);
}

async function verifyJwtSignature(
  encodedHeader: string,
  encodedPayload: string,
  encodedSignature: string,
  authSecret: string
): Promise<boolean> {
  try {
    const signingInput = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
    const signature = toBase64UrlBuffer(encodedSignature);

    if (!signature) {
      return false;
    }

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(authSecret),
      {
        name: 'HMAC',
        hash: 'SHA-256',
      },
      false,
      ['verify']
    );

    return crypto.subtle.verify('HMAC', cryptoKey, signature, signingInput);
  }
  catch {
    return false;
  }
}

function toJwtSegment(encodedSegment: string): Record<string, unknown> | null {
  const decodedText = toBase64UrlText(encodedSegment);

  if (!decodedText) {
    return null;
  }

  try {
    return JSON.parse(decodedText) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function toBase64UrlText(encodedSegment: string): string | null {
  try {
    const normalizedSegment = encodedSegment.replace(/-/g, '+').replace(/_/g, '/');
    const paddingLength = (4 - (normalizedSegment.length % 4)) % 4;
    const paddedSegment = `${normalizedSegment}${'='.repeat(paddingLength)}`;

    return atob(paddedSegment);
  } catch {
    return null;
  }
}

function toBase64UrlBuffer(encodedSegment: string): ArrayBuffer | null {
  const decodedText = toBase64UrlText(encodedSegment);

  if (!decodedText) {
    return null;
  }

  const byteArray = Uint8Array.from(decodedText, (character) => character.charCodeAt(0));

  return byteArray.buffer.slice(byteArray.byteOffset, byteArray.byteOffset + byteArray.byteLength);
}
