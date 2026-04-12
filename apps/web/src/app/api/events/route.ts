import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/auth-session';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const accessToken = await getSessionToken();

  if (!accessToken) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/events`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Failed to connect to events stream.' },
      { status: response.status }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();

      if (!reader) {
        controller.close();
        return;
      }

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            controller.close();
            return;
          }

          controller.enqueue(value);
        }
      } catch {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
