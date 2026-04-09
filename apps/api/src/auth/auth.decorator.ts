import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { AUTH_PUBLIC_ROUTE_KEY } from './auth.constants';
import { AuthenticatedUser } from './auth.types';

interface AuthenticatedRequest {
  readonly user?: AuthenticatedUser;
}

export const Public = () => SetMetadata(AUTH_PUBLIC_ROUTE_KEY, true);

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException('Authentication is required.');
    }

    return request.user;
  }
);
