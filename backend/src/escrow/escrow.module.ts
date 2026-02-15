import { Module } from '@nestjs/common';
import { EscrowController } from './escrow.controller';
import { EscrowService } from './escrow.service';
import { EscrowTimelineController } from './escrow-timeline.controller';
import { EscrowTimelineService } from './escrow-timeline.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EscrowController, EscrowTimelineController],
  providers: [EscrowService, EscrowTimelineService],
  exports: [EscrowService, EscrowTimelineService],
})
export class EscrowModule {}
