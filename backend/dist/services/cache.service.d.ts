export declare class CacheService {
    private cache;
    private readonly logger;
    private readonly defaultTTL;
    set(key: string, data: any, ttl?: number): void;
    get(key: string): any | null;
    delete(key: string): boolean;
    clear(): void;
    getStats(): {
        size: number;
        memoryUsage: number;
    };
}
