import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    constructor();
    private isConnected;
    ensureConnected(): Promise<void>;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    cleanDb(): Promise<void>;
}
