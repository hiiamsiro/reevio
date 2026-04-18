import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL ?? 'http://localhost:4000';
const STORAGE_PUBLIC_BASE_URL = process.env.STORAGE_PUBLIC_BASE_URL ?? API_BASE_URL;

const RESPONSE_HEADER_NAMES = [
  'accept-ranges',
  'cache-control',
  'content-length',
  'content-range',
  'content-type',
  'etag',
  'last-modified',
] as const;

export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const targetUrl = requestUrl.searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: 'Media URL is required.',
      },
      { status: 400 }
    );
  }

  if (!isAllowedMediaUrl(targetUrl)) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: 'Media URL is not allowed.',
      },
      { status: 403 }
    );
  }

  const headers = new Headers();
  const rangeHeader = request.headers.get('range');

  if (rangeHeader) {
    headers.set('range', rangeHeader);
  }

  const upstreamResponse = await fetch(targetUrl, {
    headers,
    cache: 'no-store',
    redirect: 'follow',
  });

  if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: 'Failed to load media.',
      },
      { status: upstreamResponse.status }
    );
  }

  const responseHeaders = new Headers();

  for (const headerName of RESPONSE_HEADER_NAMES) {
    const headerValue = upstreamResponse.headers.get(headerName);

    if (headerValue) {
      responseHeaders.set(headerName, headerValue);
    }
  }

  if (!responseHeaders.has('cache-control')) {
    responseHeaders.set('cache-control', 'private, no-store');
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

function isAllowedMediaUrl(targetUrl: string): boolean {
  try {
    const parsedTargetUrl = new URL(targetUrl);
    const allowedOrigins = [API_BASE_URL, STORAGE_PUBLIC_BASE_URL]
      .map((origin) => {
        try {
          return new URL(origin).origin;
        } catch {
          return null;
        }
      })
      .filter((origin): origin is string => origin !== null);

    return allowedOrigins.includes(parsedTargetUrl.origin);
  } catch {
    return false;
  }
}
