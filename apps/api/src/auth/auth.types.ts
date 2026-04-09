import { User } from '@reevio/types';

export interface AuthTokenPayload {
  readonly sub: string;
  readonly email: string;
}

export interface AuthSessionRecord {
  readonly user: User;
  readonly accessToken: string;
  readonly expiresAt: string;
}

export type AuthenticatedUser = User;
