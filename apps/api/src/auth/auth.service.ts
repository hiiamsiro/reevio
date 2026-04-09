import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { User as PrismaUser } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AUTH_DEFAULT_CREDITS, AUTH_TOKEN_TTL_SECONDS } from './auth.constants';
import { AuthRateLimitService } from './auth-rate-limit.service';
import {
  AuthEmailAlreadyRegisteredError,
  AuthInvalidCredentialsError,
} from './auth.errors';
import { toAppUser, toNormalizedEmail, toRateLimitIdentifier } from './auth.mappers';
import { hashPassword, verifyPassword } from './auth-password';
import { AuthSessionRecord, AuthenticatedUser, AuthTokenPayload } from './auth.types';

@Injectable()
export class AuthService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly authRateLimitService: AuthRateLimitService
  ) {}

  public async register(
    email: string,
    password: string,
    ipAddress: string
  ): Promise<AuthSessionRecord> {
    const normalizedEmail = toNormalizedEmail(email);
    const rateLimitIdentifier = toRateLimitIdentifier(normalizedEmail, ipAddress);

    this.authRateLimitService.assertCanAttempt(rateLimitIdentifier);

    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      this.authRateLimitService.recordFailure(rateLimitIdentifier);
      throw new AuthEmailAlreadyRegisteredError(normalizedEmail);
    }

    const passwordHash = await hashPassword(password);
    let user: PrismaUser;

    try {
      user = await this.prismaService.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          plan: 'FREE',
          credits: AUTH_DEFAULT_CREDITS,
        },
      });
    } catch (error: unknown) {
      if (isUniqueEmailConstraintError(error)) {
        this.authRateLimitService.recordFailure(rateLimitIdentifier);
        throw new AuthEmailAlreadyRegisteredError(normalizedEmail);
      }

      throw error;
    }

    this.authRateLimitService.clear(rateLimitIdentifier);

    return this.createSession(user);
  }

  public async login(email: string, password: string, ipAddress: string): Promise<AuthSessionRecord> {
    const normalizedEmail = toNormalizedEmail(email);
    const rateLimitIdentifier = toRateLimitIdentifier(normalizedEmail, ipAddress);

    this.authRateLimitService.assertCanAttempt(rateLimitIdentifier);

    const user = await this.prismaService.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user?.passwordHash) {
      this.authRateLimitService.recordFailure(rateLimitIdentifier);
      throw new AuthInvalidCredentialsError();
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      this.authRateLimitService.recordFailure(rateLimitIdentifier);
      throw new AuthInvalidCredentialsError();
    }

    this.authRateLimitService.clear(rateLimitIdentifier);

    return this.createSession(user);
  }

  public async getAuthenticatedUser(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Authentication token is invalid.');
    }

    return toAppUser(user);
  }

  private async createSession(user: PrismaUser): Promise<AuthSessionRecord> {
    const tokenPayload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    const expiresAt = new Date(Date.now() + AUTH_TOKEN_TTL_SECONDS * 1000).toISOString();

    return {
      user: toAppUser(user),
      accessToken,
      expiresAt,
    };
  }
}

function isUniqueEmailConstraintError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  return error.code === 'P2002';
}
