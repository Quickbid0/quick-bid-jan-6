import { Module } from '@nestjs/common';
import { KYCController } from './kyc.controller';
import { KYCService } from './kyc.service';

@Module({
  controllers: [KYCController],
  providers: [KYCService],
  exports: [KYCService],
})
export class KYCModule {}
