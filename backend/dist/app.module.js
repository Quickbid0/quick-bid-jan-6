"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const core_1 = require("@nestjs/core");
const Sentry = __importStar(require("@sentry/nestjs"));
const auth_module_1 = require("./auth/auth.module");
const products_module_1 = require("./products/products.module");
const wallet_module_1 = require("./wallet/wallet.module");
const kyc_module_1 = require("./kyc/kyc.module");
const penalty_module_1 = require("./penalty/penalty.module");
const company_module_1 = require("./company/company.module");
const auctions_module_1 = require("./auctions/auctions.module");
const inspection_module_1 = require("./inspection/inspection.module");
const finance_module_1 = require("./finance/finance.module");
const reputation_module_1 = require("./reputation/reputation.module");
const disputes_module_1 = require("./disputes/disputes.module");
const escrow_module_1 = require("./escrow/escrow.module");
const compliance_module_1 = require("./compliance/compliance.module");
const analytics_module_1 = require("./analytics/analytics.module");
const investor_metrics_module_1 = require("./analytics/investor-metrics.module");
const audit_module_1 = require("./audit/audit.module");
const dealer_module_1 = require("./dealer/dealer.module");
const payments_module_1 = require("./payments/payments.module");
const notifications_module_1 = require("./notifications/notifications.module");
const webhook_module_1 = require("./webhooks/webhook.module");
const referral_module_1 = require("./referral/referral.module");
const feature_flag_module_1 = require("./feature-flag/feature-flag.module");
const launch_campaign_module_1 = require("./launch-campaign/launch-campaign.module");
const subscription_module_1 = require("./subscription/subscription.module");
const bid_control_module_1 = require("./bid-control/bid-control.module");
const account_tier_module_1 = require("./account-tier/account-tier.module");
const fee_override_module_1 = require("./fee-override/fee-override.module");
const wallet_bonus_module_1 = require("./wallet-bonus/wallet-bonus.module");
const investor_dashboard_module_1 = require("./investor-dashboard/investor-dashboard.module");
const marketplace_metrics_module_1 = require("./marketplace-metrics/marketplace-metrics.module");
const safety_rules_module_1 = require("./safety-rules/safety-rules.module");
const admin_launch_control_module_1 = require("./admin-launch-control/admin-launch-control.module");
const pre_launch_simulation_module_1 = require("./pre-launch-simulation/pre-launch-simulation.module");
const app_controller_1 = require("./app.controller");
const rate_limiting_interceptor_1 = require("./interceptors/rate-limiting.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            Sentry.SentryModule.forRoot(),
            auth_module_1.AuthModule,
            products_module_1.ProductsModule,
            wallet_module_1.WalletModule,
            payments_module_1.PaymentsModule,
            kyc_module_1.KYCModule,
            penalty_module_1.PenaltyModule,
            company_module_1.CompanyModule,
            auctions_module_1.AuctionsModule,
            inspection_module_1.InspectionModule,
            finance_module_1.FinanceModule,
            reputation_module_1.ReputationModule,
            disputes_module_1.DisputesModule,
            escrow_module_1.EscrowModule,
            compliance_module_1.ComplianceModule,
            analytics_module_1.AnalyticsModule,
            investor_metrics_module_1.InvestorMetricsModule,
            audit_module_1.AuditModule,
            dealer_module_1.DealerModule,
            payments_module_1.PaymentsModule,
            notifications_module_1.NotificationsModule,
            webhook_module_1.WebhookModule,
            referral_module_1.ReferralModule,
            feature_flag_module_1.FeatureFlagModule,
            launch_campaign_module_1.LaunchCampaignModule,
            subscription_module_1.SubscriptionModule,
            bid_control_module_1.BidControlModule,
            account_tier_module_1.AccountTierModule,
            fee_override_module_1.FeeOverrideModule,
            wallet_bonus_module_1.WalletBonusModule,
            investor_dashboard_module_1.InvestorDashboardModule,
            marketplace_metrics_module_1.MarketplaceMetricsModule,
            safety_rules_module_1.SafetyRulesModule,
            admin_launch_control_module_1.AdminLaunchControlModule,
            pre_launch_simulation_module_1.PreLaunchSimulationModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: rate_limiting_interceptor_1.RateLimitingInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map