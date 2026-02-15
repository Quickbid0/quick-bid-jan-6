import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CompanySecurityMiddleware } from '../middleware/company-security.middleware';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CompanySecurityMiddleware)
      .forRoutes(CompanyController);
  }
}
