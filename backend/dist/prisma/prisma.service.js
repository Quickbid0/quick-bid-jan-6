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
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class PrismaService extends client_1.PrismaClient {
    constructor() {
        super({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL || 'file:./mock.db',
                },
            },
        });
        this.logger = new common_1.Logger(PrismaService.name);
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
}
exports.PrismaService = PrismaService;
//# sourceMappingURL=prisma.service.js.map