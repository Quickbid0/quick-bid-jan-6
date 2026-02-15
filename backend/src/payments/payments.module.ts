// src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { IndianPaymentController } from './indian-payment.controller';
import { IndianPaymentService } from './indian-payment.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IndianPaymentController],
  providers: [IndianPaymentService],
  exports: [IndianPaymentService],
})
export class PaymentsModule {}
