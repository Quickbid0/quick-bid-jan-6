import { PrismaService } from './prisma/prisma.service';
export declare class AppController {
    private prisma;
    constructor(prisma: PrismaService);
    getHealth(): {
        status: string;
        timestamp: string;
        service: string;
        environment: string;
    };
    checkDatabase(): Promise<string>;
    getDetailedHealth(): Promise<{
        status: string;
        timestamp: string;
        service: string;
        environment: string;
        database: string;
    }>;
    triggerSentryError(): {
        message: string;
        timestamp: string;
        environment: string;
        sentryConfigured: boolean;
    };
}
