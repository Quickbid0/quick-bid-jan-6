import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET') || 'quickmela-jwt-secret-key-production-secure-minimum-32-chars-verified';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret.length >= 32 ? secret : 'quickmela-jwt-secret-key-production-secure-minimum-32-chars-verified'
    });
  }

  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      id: payload.sub,
      email: payload.email, 
      role: payload.role 
    };
  }
}

