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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const dotenv = require("dotenv");
dotenv.config();
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL || 'file:./mock.db',
                },
            },
        });
        this.logger = new common_1.Logger(PrismaService_1.name);
        this.isConnected = false;
        if (!process.env.DATABASE_URL) {
            this.logger.warn('DATABASE_URL not set - running in mock mode');
        }
    }
    async ensureConnected() {
        if (!this.isConnected) {
            await this.$connect();
            this.isConnected = true;
        }
    }
    async $connect() {
        return super.$connect();
    }
    async $disconnect() {
        this.isConnected = false;
        return super.$disconnect();
    }
    async onModuleInit() {
        this.logger.log('PrismaService initialized (lazy connection mode)');
        if (!process.env.DATABASE_URL) {
            this.logger.warn('DATABASE_URL environment variable is not set');
            this.logger.warn('Database-dependent features will be disabled');
            return;
        }
        this.logger.log('DATABASE_URL detected, will connect on first query');
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
    async cleanDb() {
        if (process.env.NODE_ENV === 'development') {
            await this.ensureConnected();
            if (!this.isConnected) {
                this.logger.warn('Cannot clean DB - no database connection');
                return;
            }
            try {
                await this.user.deleteMany();
                await this.product.deleteMany();
                await this.auction.deleteMany();
                this.logger.log('Database cleaned successfully');
            }
            catch (error) {
                this.logger.error('Failed to clean database:', error.message);
            }
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map