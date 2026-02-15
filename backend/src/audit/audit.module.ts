import { Module } from '@nestjs/common';
import { StabilityAuditController } from './stability-audit.controller';
import { StabilityAuditService } from './stability-audit.service';
import { SecurityPenetrationController } from './security-penetration.controller';
import { SecurityPenetrationService } from './security-penetration.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StabilityAuditController, SecurityPenetrationController],
  providers: [StabilityAuditService, SecurityPenetrationService],
  exports: [StabilityAuditService, SecurityPenetrationService],
})
export class AuditModule {}
