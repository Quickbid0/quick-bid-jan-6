import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { WhatsAppService } from './whatsapp.service';
import { TemplateManagerService } from './template.manager';
import { NotificationQueueService } from './notification.queue';
import { NotificationController } from './notification.controller';
import { RetryService } from './retry.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [NotificationController],
  providers: [
    WhatsAppService,
    TemplateManagerService,
    NotificationQueueService,
    RetryService,
    PrismaService,
  ],
  exports: [WhatsAppService, TemplateManagerService, NotificationQueueService],
})
export class NotificationModule {}
