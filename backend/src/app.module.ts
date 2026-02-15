import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { WalletModule } from './wallet/wallet.module';
import { PaymentModule } from './payments/payment.module';
import { KYCModule } from './kyc/kyc.module';
import { PenaltyModule } from './penalty/penalty.module';
import { CompanyModule } from './company/company.module';
import { AuctionsModule } from './auctions/auctions.module';
import { InspectionModule } from './inspection/inspection.module';
import { FinanceModule } from './finance/finance.module';
import { ReputationModule } from './reputation/reputation.module';
import { DisputesModule } from './disputes/disputes.module';
import { EscrowModule } from './escrow/escrow.module';
import { ComplianceModule } from './compliance/compliance.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { InvestorMetricsModule } from './analytics/investor-metrics.module';
import { AuditModule } from './audit/audit.module';
import { DealerModule } from './dealer/dealer.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WebhookModule } from './webhooks/webhook.module';
import { ReferralModule } from './referral/referral.module';
import { FeatureFlagModule } from './feature-flag/feature-flag.module';
import { LaunchCampaignModule } from './launch-campaign/launch-campaign.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { BidControlModule } from './bid-control/bid-control.module';
import { AccountTierModule } from './account-tier/account-tier.module';
import { FeeOverrideModule } from './fee-override/fee-override.module';
import { WalletBonusModule } from './wallet-bonus/wallet-bonus.module';
import { InvestorDashboardModule } from './investor-dashboard/investor-dashboard.module';
import { MarketplaceMetricsModule } from './marketplace-metrics/marketplace-metrics.module';
import { SafetyRulesModule } from './safety-rules/safety-rules.module';
import { AdminLaunchControlModule } from './admin-launch-control/admin-launch-control.module';
import { PreLaunchSimulationModule } from './pre-launch-simulation/pre-launch-simulation.module';
import { AppController } from './app.controller';
// import { TestDbController } from './test-db.controller';
import { RateLimitingInterceptor } from './interceptors/rate-limiting.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),

    // Sentry monitoring module
    Sentry.SentryModule.forRoot(),

    AuthModule,
    ProductsModule,
    WalletModule,
    PaymentsModule,
    KYCModule,
    PenaltyModule,
    CompanyModule,
    AuctionsModule,
    InspectionModule,
    FinanceModule,
    ReputationModule,
    DisputesModule,
    EscrowModule,
    ComplianceModule,
    AnalyticsModule,
    InvestorMetricsModule,
    AuditModule,
    DealerModule,
    PaymentsModule,
    NotificationsModule,
    WebhookModule,
    ReferralModule,
    FeatureFlagModule,
    LaunchCampaignModule,
    SubscriptionModule,
    BidControlModule,
    AccountTierModule,
    FeeOverrideModule,
    WalletBonusModule,
    InvestorDashboardModule,
    MarketplaceMetricsModule,
    SafetyRulesModule,
    AdminLaunchControlModule,
    PreLaunchSimulationModule,
  ],
  controllers: [AppController], // [TestDbController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimitingInterceptor,
    },
  ],
})
export class AppModule {}
