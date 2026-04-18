import type { GeneratedImageProvider } from '@reevio/types';

interface RuntimeRedisLike {
  expire(key: string, seconds: number): Promise<number> | number;
  get(key: string): Promise<string | null> | string | null;
  incr(key: string): Promise<number> | number;
  setex(key: string, seconds: number, value: string): Promise<unknown> | unknown;
}

export interface ImageProviderRuntimeStore {
  getFailureCount(provider: GeneratedImageProvider): Promise<number>;
  incrementFailure(provider: GeneratedImageProvider): Promise<number>;
  isCoolingDown(provider: GeneratedImageProvider): Promise<boolean>;
  startCooldown(provider: GeneratedImageProvider, reason: string): Promise<void>;
}

const FAILURE_TTL_SECONDS = 3600;

export class RedisImageProviderRuntimeStore implements ImageProviderRuntimeStore {
  public constructor(
    private readonly redis: RuntimeRedisLike,
    private readonly cooldownSeconds: number
  ) {}

  public async getFailureCount(provider: GeneratedImageProvider): Promise<number> {
    const currentValue = await this.redis.get(getFailureKey(provider));
    return currentValue ? Number.parseInt(currentValue, 10) || 0 : 0;
  }

  public async incrementFailure(provider: GeneratedImageProvider): Promise<number> {
    const nextValue = await this.redis.incr(getFailureKey(provider));
    await this.redis.expire(getFailureKey(provider), FAILURE_TTL_SECONDS);
    return nextValue;
  }

  public async isCoolingDown(provider: GeneratedImageProvider): Promise<boolean> {
    const cooldownValue = await this.redis.get(getCooldownKey(provider));
    return cooldownValue !== null;
  }

  public async startCooldown(provider: GeneratedImageProvider, reason: string): Promise<void> {
    await this.redis.setex(getCooldownKey(provider), this.cooldownSeconds, reason);
  }
}

export class MemoryImageProviderRuntimeStore implements ImageProviderRuntimeStore {
  private readonly cooldowns = new Map<GeneratedImageProvider, number>();
  private readonly failureCounts = new Map<GeneratedImageProvider, number>();

  public constructor(private readonly cooldownSeconds: number) {}

  public async getFailureCount(provider: GeneratedImageProvider): Promise<number> {
    return this.failureCounts.get(provider) ?? 0;
  }

  public async incrementFailure(provider: GeneratedImageProvider): Promise<number> {
    const nextValue = (this.failureCounts.get(provider) ?? 0) + 1;
    this.failureCounts.set(provider, nextValue);
    return nextValue;
  }

  public async isCoolingDown(provider: GeneratedImageProvider): Promise<boolean> {
    const expiresAt = this.cooldowns.get(provider);

    if (!expiresAt) {
      return false;
    }

    if (expiresAt <= Date.now()) {
      this.cooldowns.delete(provider);
      return false;
    }

    return true;
  }

  public async startCooldown(provider: GeneratedImageProvider): Promise<void> {
    this.cooldowns.set(provider, Date.now() + this.cooldownSeconds * 1000);
  }
}

function getCooldownKey(provider: GeneratedImageProvider): string {
  return `image-provider:${provider}:cooldown`;
}

function getFailureKey(provider: GeneratedImageProvider): string {
  return `image-provider:${provider}:failures`;
}
