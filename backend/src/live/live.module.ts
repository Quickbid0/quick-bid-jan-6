import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LiveGateway } from './live.gateway';
import { LiveController } from './live.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [LiveGateway],
  controllers: [LiveController],
})
export class LiveModule {}
