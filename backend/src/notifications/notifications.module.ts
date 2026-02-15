// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { SMSService } from './sms.service';
import { EmailService } from './email.service';

@Module({
  controllers: [NotificationsController],
  providers: [SMSService, EmailService],
  exports: [SMSService, EmailService],
})
export class NotificationsModule {}
