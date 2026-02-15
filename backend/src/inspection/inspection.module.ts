import { Module } from '@nestjs/common';
import { VehicleInspectionController } from './vehicle-inspection.controller';
import { VehicleInspectionService } from '../ai/vehicle-inspection.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VehicleInspectionController],
  providers: [VehicleInspectionService],
  exports: [VehicleInspectionService],
})
export class InspectionModule {}
