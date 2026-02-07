import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Account, Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<Account> {
    try {
      // Verify user exists and is active
      const user = await this.prismaService.account.findUnique({
        where: { 
          id: payload.sub,
          isActive: true,
          status: 'ACTIVE'
        },
        include: {
          profile: true
        }
      });

      if (!user) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Remove sensitive data from response
      const { passwordHash, verificationToken, resetPasswordToken, resetTokenExpiry, ...userResult } = user;
      
      return userResult;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
