import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { WalletModule } from './wallet/wallet.module';
import { PaymentModule } from './payments/payment.module';
import { KYCModule } from './kyc/kyc.module';
import { PenaltyModule } from './penalty/penalty.module';
import { CompanyModule } from './company/company.module';
import { AuctionsModule } from './auctions/auctions.module';
import { AppController } from './app.controller';
// import { TestDbController } from './test-db.controller';
import { RateLimitingInterceptor } from './interceptors/rate-limiting.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    ProductsModule,
    WalletModule,
    PaymentModule,
    KYCModule,
    PenaltyModule,
    CompanyModule,
    AuctionsModule,
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
