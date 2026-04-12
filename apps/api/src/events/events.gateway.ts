import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { Env } from '@reevio/config';
import { CurrentUser } from '../auth/auth.decorator';
import { AuthenticatedUser } from '../auth/auth.types';

const REDIS_CHANNEL = 'video:events';

@Controller()
export class EventsController {
  public constructor(private readonly configService: ConfigService<Env, true>) {}

  @Get('events')
  public async events(
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response
  ): Promise<void> {
    const userId = user.id;
    const redisUrl = this.configService.getOrThrow('REDIS_URL', { infer: true });

    // Each SSE connection gets its own Redis subscriber
    const subscriber = new Redis(redisUrl);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    res.write(`: connected\n\n`);

    const messageHandler = (channel: string, message: string) => {
      if (channel !== REDIS_CHANNEL) return;

      try {
        const event = JSON.parse(message) as {
          readonly event: string;
          readonly videoId: string;
          readonly userId: string;
          readonly status?: string;
          readonly outputUrl?: string | null;
          readonly previewUrl?: string | null;
          readonly step?: string;
          readonly errorCode?: string | null;
          readonly errorMessage?: string | null;
        };

        if (event.userId !== userId) return;

        const eventName = event.event === 'video.step' ? 'video.step' : event.event;

        const data = event.event === 'video.step'
          ? { videoId: event.videoId, step: event.step }
          : {
              videoId: event.videoId,
              status: event.status,
              outputUrl: event.outputUrl ?? null,
              previewUrl: event.previewUrl ?? null,
              errorCode: event.errorCode ?? null,
              errorMessage: event.errorMessage ?? null,
            };

        res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
      } catch {
        // ignore malformed messages
      }
    };

    const errorHandler = (error: Error) => {
      try {
        res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
      } catch {
        // response already closed
      }
    };

    await new Promise<void>((resolve, reject) => {
      subscriber.subscribe(REDIS_CHANNEL, (err) => {
        if (err) {
          void subscriber.quit();
          reject(err);
          return;
        }
        resolve();
      });
    });

    subscriber.on('message', messageHandler);
    subscriber.on('error', errorHandler);

    res.on('close', () => {
      subscriber.off('message', messageHandler);
      subscriber.off('error', errorHandler);
      void subscriber.quit();
    });
  }
}
