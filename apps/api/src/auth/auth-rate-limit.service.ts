import { Injectable } from '@nestjs/common';
import {
  AUTH_RATE_LIMIT_MAX_ATTEMPTS,
  AUTH_RATE_LIMIT_WINDOW_MS,
} from './auth.constants';
import { AuthRateLimitError } from './auth.errors';

interface AuthAttemptWindow {
  readonly expiresAtMs: number;
  readonly attempts: number;
}

@Injectable()
export class AuthRateLimitService {
  private readonly attemptWindows = new Map<string, AuthAttemptWindow>();

  public assertCanAttempt(identifier: string): void {
    this.pruneExpiredWindows();

    const activeWindow = this.getActiveWindow(identifier);

    if (!activeWindow) {
      return;
    }

    if (activeWindow.attempts >= AUTH_RATE_LIMIT_MAX_ATTEMPTS) {
      throw new AuthRateLimitError();
    }
  }

  public recordFailure(identifier: string): void {
    this.pruneExpiredWindows();

    const activeWindow = this.getActiveWindow(identifier);
    const nextAttempts = activeWindow ? activeWindow.attempts + 1 : 1;

    this.attemptWindows.set(identifier, {
      attempts: nextAttempts,
      expiresAtMs: Date.now() + AUTH_RATE_LIMIT_WINDOW_MS,
    });
  }

  public clear(identifier: string): void {
    this.attemptWindows.delete(identifier);
  }

  private getActiveWindow(identifier: string): AuthAttemptWindow | null {
    const activeWindow = this.attemptWindows.get(identifier);

    if (!activeWindow) {
      return null;
    }

    if (activeWindow.expiresAtMs <= Date.now()) {
      this.attemptWindows.delete(identifier);
      return null;
    }

    return activeWindow;
  }

  private pruneExpiredWindows(): void {
    const nowMs = Date.now();

    for (const [identifier, attemptWindow] of this.attemptWindows.entries()) {
      if (attemptWindow.expiresAtMs <= nowMs) {
        this.attemptWindows.delete(identifier);
      }
    }
  }
}
