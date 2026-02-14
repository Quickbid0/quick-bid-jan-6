"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestDbController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
let TestDbController = class TestDbController {
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async testDatabase() {
        try {
            const count = await this.prismaService.user.count();
            return {
                status: 'connected',
                message: 'Database connection successful',
                accountCount: count,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: 'Database connection failed',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.TestDbController = TestDbController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestDbController.prototype, "testDatabase", null);
exports.TestDbController = TestDbController = __decorate([
    (0, common_1.Controller)('test-db'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TestDbController);
//# sourceMappingURL=test-db.controller.js.map