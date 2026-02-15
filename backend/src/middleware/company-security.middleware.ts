import { Injectable, NestMiddleware, Logger, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../auth/auth.service';
import { AuditService } from '../audit/audit.service';
import { Role } from '@prisma/client';

interface DeviceFingerprint {
  userAgent: string;
  ipAddress: string;
  acceptLanguage: string;
  platform: string;
  screenResolution?: string;
  timezone?: string;
  fingerprint: string;
}

@Injectable()
export class CompanySecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CompanySecurityMiddleware.name);

  constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) {}

  async use(req: Request & { user?: any }, res: Response, next: NextFunction) {
    const user = req.user;

    // Only apply security checks for COMPANY_OWNER role
    if (!user || user.role !== Role.COMPANY_OWNER) {
      return next();
    }

    try {
      // 1. IP Logging
      await this.logAccessAttempt(user.id, req);

      // 2. Device Fingerprinting
      const fingerprint = this.generateDeviceFingerprint(req);
      await this.validateDeviceFingerprint(user.id, fingerprint);

      // 3. 2FA Verification (if enabled)
      if (user.twoFactorEnabled) {
        await this.verify2FA(req, user.id);
      }

      // 4. Activity Audit Logging
      await this.auditActivity(user.id, req);

      next();
    } catch (error) {
      this.logger.error(`Company security check failed for user ${user.id}: ${error.message}`);
      throw new BadRequestException('Security verification failed. Please contact support.');
    }
  }

  private async logAccessAttempt(userId: string, req: Request) {
    const ipAddress = this.getClientIP(req);
    const userAgent = req.get('User-Agent') || '';

    // Log IP access attempt
    await this.auditService.logActivity({
      userId: user.id,
      action: 'COMPANY_ACCESS_ATTEMPT',
      resource: 'security',
      category: 'security',
      severity: 'low',
      ipAddress,
      userAgent,
      metadata: {
        timestamp: new Date(),
        endpoint: req.originalUrl,
        method: req.method,
      },
    });

    this.logger.log(`Company access attempt: User ${userId} from IP ${ipAddress}`);
  }

  private generateDeviceFingerprint(req: Request): DeviceFingerprint {
    const userAgent = req.get('User-Agent') || '';
    const ipAddress = this.getClientIP(req);
    const acceptLanguage = req.get('Accept-Language') || '';
    const platform = this.extractPlatform(userAgent);

    // Generate a simple fingerprint based on key attributes
    const fingerprintData = `${userAgent}${ipAddress}${acceptLanguage}${platform}`;
    const fingerprint = this.simpleHash(fingerprintData);

    return {
      userAgent,
      ipAddress,
      acceptLanguage,
      platform,
      fingerprint,
    };
  }

  private async validateDeviceFingerprint(userId: string, fingerprint: DeviceFingerprint) {
    // In a real implementation, you'd store known device fingerprints for each user
    // and check if the current fingerprint matches any known device
    // For now, we'll just log and allow (simulated trust)

    // Check if device is known (simulated)
    const isKnownDevice = await this.isKnownDevice(userId, fingerprint.fingerprint);

    if (!isKnownDevice) {
      // Log suspicious device access
      await this.auditService.logActivity({
        userId,
        action: 'UNKNOWN_DEVICE_ACCESS',
        resource: 'security',
        category: 'security',
        severity: 'medium',
        metadata: {
          fingerprint: fingerprint.fingerprint,
          deviceInfo: fingerprint,
          timestamp: new Date(),
          riskLevel: 'MEDIUM',
        },
      });

      this.logger.warn(`Unknown device access for company user ${userId}: ${fingerprint.fingerprint}`);
    }

    return true;
  }

  private async verify2FA(req: Request, userId: string) {
    // Check if 2FA token is provided in request
    const twoFactorToken = req.headers['x-2fa-token'] as string;

    if (!twoFactorToken) {
      throw new BadRequestException('2FA token required for company access');
    }

    // Verify 2FA token (simulated)
    const isValid = await this.authService.verify2FAToken(userId, twoFactorToken);

    if (!isValid) {
      await this.auditService.logActivity(userId, 'FAILED_2FA_ATTEMPT', {
        timestamp: new Date(),
        ipAddress: this.getClientIP(req),
      });

      throw new BadRequestException('Invalid 2FA token');
    }

    this.logger.log(`2FA verification successful for company user ${userId}`);
  }

  private async auditActivity(userId: string, req: Request) {
    await this.auditService.logActivity({
      userId,
      action: 'COMPANY_ACTIVITY',
      resource: 'company',
      category: 'user',
      severity: 'low',
      method: req.method,
      endpoint: req.originalUrl,
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent'),
      metadata: {
        timestamp: new Date(),
        requestBody: req.method !== 'GET' ? JSON.stringify((req as any).body) : null,
      },
    });
  }

  private getClientIP(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection as any).socket?.remoteAddress ||
      'unknown'
    );
  }

  private extractPlatform(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private async isKnownDevice(userId: string, fingerprint: string): Promise<boolean> {
    // Simulated device recognition
    // In real implementation, this would check against a database of known devices
    return Math.random() > 0.3; // 70% chance of being a known device
  }
}
