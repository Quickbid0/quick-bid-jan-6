import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET') || 'quickmela-jwt-secret-key-production-secure-minimum-32-chars-verified';
    super({
      // ✅ FIX S-02: Extract JWT from httpOnly cookie first, then Bearer token
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Try httpOnly cookie first
        (req: Request) => {
          if (req.cookies && req.cookies.access_token) {
            return req.cookies.access_token;
          }
          return null;
        },
        // 2. Fallback to Authorization: Bearer header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret.length >= 32 ? secret : 'quickmela-jwt-secret-key-production-secure-minimum-32-chars-verified'
    });
  }

  async validate(payload: any) {
    console.log('JWT validated for user', payload.email);
    // ✅ FIX S-01: Never accept role from request body or cookies apart from JWT
    return { 
      userId: payload.sub, 
      id: payload.sub,
      email: payload.email, 
      role: payload.role  // From JWT only
    };
  }
}

