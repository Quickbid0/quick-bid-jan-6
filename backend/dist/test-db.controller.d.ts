import { PrismaService } from './prisma/prisma.service';
export declare class TestDbController {
    private prismaService;
    constructor(prismaService: PrismaService);
    testDatabase(): Promise<{
        status: string;
        message: string;
        accountCount: number;
        timestamp: string;
        error?: undefined;
    } | {
        status: string;
        message: string;
        error: any;
        timestamp: string;
        accountCount?: undefined;
    }>;
}
