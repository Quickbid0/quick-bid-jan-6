import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;

    // Skip CSRF check for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    const csrfToken = request.headers['x-csrf-token'] as string;
    const csrfCookie = request.cookies?.['csrf_token'];

    if (!csrfToken || !csrfCookie || csrfToken !== csrfCookie) {
      throw new UnauthorizedException('Invalid CSRF token');
    }

    return true;
  }
}
