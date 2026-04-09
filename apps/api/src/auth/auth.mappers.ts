import { User as PrismaUser } from '@prisma/client';
import { User } from '@reevio/types';
import { toAppUserPlan } from '../database/prisma-value.mappers';

export function toAppUser(user: PrismaUser): User {
  return {
    id: user.id,
    email: user.email,
    ...(user.name ? { name: user.name } : {}),
    plan: toAppUserPlan(user.plan),
    credits: user.credits,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function toNormalizedEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function toRateLimitIdentifier(email: string, ipAddress: string): string {
  return `${ipAddress}:${email}`;
}
