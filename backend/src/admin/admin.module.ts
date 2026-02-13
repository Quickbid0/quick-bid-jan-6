import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { ApprovalService } from './approval.service';
import { EnhancedUserManagementService } from './enhanced-user-management.service';
import { EnhancedProductManagementService } from './enhanced-product-management.service';
import { AdminUserService } from './admin-user.service';
import { AdminAuctionService } from './admin-auction.service';
import { AdminAuctionController } from './admin-auction.controller';
import { AdminUserController } from './admin-user.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import { AuctionsModule } from '../auctions/auctions.module';
import { ObservabilityModule } from '../observability/observability.module';

@Module({
  imports: [ObservabilityModule, AuctionsModule],
  controllers: [
    AdminController,
    AdminAuctionController,
    AdminUserController
  ],
  providers: [
    AdminDashboardService,
    ApprovalService,
    EnhancedUserManagementService,
    EnhancedProductManagementService,
    AdminUserService,
    AdminAuctionService,
    PrismaService,
    AIService,
  ],
  exports: [
    AdminDashboardService,
    ApprovalService,
    EnhancedUserManagementService,
    EnhancedProductManagementService,
    AdminUserService,
    AdminAuctionService,
    AIService,
  ],
})
export class AdminModule {}
