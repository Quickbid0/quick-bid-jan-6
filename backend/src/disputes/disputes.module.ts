import { Module } from '@nestjs/common';
import { DisputeResolutionController } from './dispute-resolution.controller';
import { DisputeResolutionService } from './dispute-resolution.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DisputeResolutionController],
  providers: [DisputeResolutionService],
  exports: [DisputeResolutionService],
})
export class DisputesModule {}
