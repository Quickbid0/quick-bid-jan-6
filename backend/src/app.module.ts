import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),

    // Sentry monitoring module
    Sentry.SentryModule.forRoot(),

    AuthModule,
    // ProductsModule,
    // WalletModule,
    // PaymentsModule,
    // KYCModule,
    // PenaltyModule,
    // CompanyModule,
    // AuctionsModule,
    // InspectionModule,
    // FinanceModule,
    // ReputationModule,
    // DisputesModule,
    // EscrowModule,
    // ComplianceModule,
    // AnalyticsModule,
    // InvestorMetricsModule,
    // AuditModule,
    // DealerModule,
    // PaymentsModule,
    // NotificationsModule,
    // WebhookModule,
    // ReferralModule,
    // FeatureFlagModule,
    // LaunchCampaignModule,
    // SubscriptionModule,
    // BidControlModule,
    // AccountTierModule,
    // FeeOverrideModule,
    // WalletBonusModule,
    // InvestorDashboardModule,
    // MarketplaceMetricsModule,
    // SafetyRulesModule,
    // AdminLaunchControlModule,
    // PreLaunchSimulationModule,
    HealthModule,
  ],
  controllers: [AppController], // [TestDbController],
})
export class AppModule {}
