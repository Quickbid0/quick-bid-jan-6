"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_controller_1 = require("./admin.controller");
const admin_dashboard_service_1 = require("./admin-dashboard.service");
const approval_service_1 = require("./approval.service");
const enhanced_user_management_service_1 = require("./enhanced-user-management.service");
const enhanced_product_management_service_1 = require("./enhanced-product-management.service");
const admin_user_service_1 = require("./admin-user.service");
const admin_auction_service_1 = require("./admin-auction.service");
const admin_auction_controller_1 = require("./admin-auction.controller");
const admin_user_controller_1 = require("./admin-user.controller");
const ai_service_1 = require("../ai/ai.service");
const auctions_module_1 = require("../auctions/auctions.module");
const observability_module_1 = require("../observability/observability.module");
const prisma_module_1 = require("../prisma/prisma.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [observability_module_1.ObservabilityModule, auctions_module_1.AuctionsModule, prisma_module_1.PrismaModule],
        controllers: [
            admin_controller_1.AdminController,
            admin_auction_controller_1.AdminAuctionController,
            admin_user_controller_1.AdminUserController
        ],
        providers: [
            admin_dashboard_service_1.AdminDashboardService,
            approval_service_1.ApprovalService,
            enhanced_user_management_service_1.EnhancedUserManagementService,
            enhanced_product_management_service_1.EnhancedProductManagementService,
            admin_user_service_1.AdminUserService,
            admin_auction_service_1.AdminAuctionService,
            ai_service_1.AIService,
        ],
        exports: [
            admin_dashboard_service_1.AdminDashboardService,
            approval_service_1.ApprovalService,
            enhanced_user_management_service_1.EnhancedUserManagementService,
            enhanced_product_management_service_1.EnhancedProductManagementService,
            admin_user_service_1.AdminUserService,
            admin_auction_service_1.AdminAuctionService,
            ai_service_1.AIService,
        ],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map