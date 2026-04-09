import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AUTH_PUBLIC_ROUTE_KEY } from './auth.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  public constructor(private readonly reflector: Reflector) {
    super();
  }

  public override canActivate(context: ExecutionContext) {
    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(AUTH_PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublicRoute) {
      return true;
    }

    return super.canActivate(context);
  }

  public override handleRequest<TUser>(error: Error | null, user: TUser | false | null): TUser {
    if (error) {
      throw error;
    }

    if (!user) {
      throw new UnauthorizedException('Authentication is required.');
    }

    return user;
  }
}
