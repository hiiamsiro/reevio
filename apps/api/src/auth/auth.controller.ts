import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser, Public } from './auth.decorator';
import {
  AuthEmailAlreadyRegisteredError,
  AuthInvalidCredentialsError,
  AuthRateLimitError,
} from './auth.errors';
import { authCredentialsSchema } from './auth.schemas';
import { AuthService } from './auth.service';
import { AuthSessionRecord, AuthenticatedUser } from './auth.types';

interface AuthEnvelope<TData> {
  readonly success: true;
  readonly data: TData;
  readonly error: null;
}

interface RequestWithIpAddress extends Request {
  readonly ip: string;
}

@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  public async register(
    @Body() body: unknown,
    @Req() request: RequestWithIpAddress
  ): Promise<AuthEnvelope<AuthSessionRecord>> {
    const parsedBody = authCredentialsSchema.safeParse(body);

    if (!parsedBody.success) {
      throw new BadRequestException(parsedBody.error.flatten());
    }

    try {
      const authSession = await this.authService.register(
        parsedBody.data.email,
        parsedBody.data.password,
        request.ip
      );

      return {
        success: true,
        data: authSession,
        error: null,
      };
    } catch (error: unknown) {
      throw toAuthHttpError(error);
    }
  }

  @Public()
  @Post('login')
  public async login(
    @Body() body: unknown,
    @Req() request: RequestWithIpAddress
  ): Promise<AuthEnvelope<AuthSessionRecord>> {
    const parsedBody = authCredentialsSchema.safeParse(body);

    if (!parsedBody.success) {
      throw new BadRequestException(parsedBody.error.flatten());
    }

    try {
      const authSession = await this.authService.login(
        parsedBody.data.email,
        parsedBody.data.password,
        request.ip
      );

      return {
        success: true,
        data: authSession,
        error: null,
      };
    } catch (error: unknown) {
      throw toAuthHttpError(error);
    }
  }

  @Get('session')
  public getSession(@CurrentUser() user: AuthenticatedUser): AuthEnvelope<AuthenticatedUser> {
    return {
      success: true,
      data: user,
      error: null,
    };
  }
}

function toAuthHttpError(error: unknown): Error {
  if (error instanceof AuthEmailAlreadyRegisteredError) {
    return new ConflictException(error.message);
  }

  if (error instanceof AuthInvalidCredentialsError) {
    return new UnauthorizedException(error.message);
  }

  if (error instanceof AuthRateLimitError) {
    return new HttpException(error.message, HttpStatus.TOO_MANY_REQUESTS);
  }

  return new InternalServerErrorException('Authentication failed.');
}
