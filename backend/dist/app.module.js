"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const core_1 = require("@nestjs/core");
const auth_module_1 = require("./auth/auth.module");
const products_module_1 = require("./products/products.module");
const wallet_module_1 = require("./wallet/wallet.module");
const payment_module_1 = require("./payments/payment.module");
const kyc_module_1 = require("./kyc/kyc.module");
const penalty_module_1 = require("./penalty/penalty.module");
const company_module_1 = require("./company/company.module");
const auctions_module_1 = require("./auctions/auctions.module");
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
            auth_module_1.AuthModule,
            products_module_1.ProductsModule,
            wallet_module_1.WalletModule,
            payment_module_1.PaymentModule,
            kyc_module_1.KYCModule,
            penalty_module_1.PenaltyModule,
            company_module_1.CompanyModule,
            auctions_module_1.AuctionsModule,
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