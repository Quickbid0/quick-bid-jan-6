interface LoadTestResult {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
}
declare class LoadTester {
    private app;
    private server;
    private baseUrl;
    constructor(baseUrl?: string);
    setup(): Promise<void>;
    cleanup(): Promise<void>;
    runLoadTest(options: {
        endpoint: string;
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        concurrentUsers: number;
        requestsPerUser: number;
        duration?: number;
        data?: any;
    }): Promise<LoadTestResult>;
    runComprehensiveLoadTests(): Promise<void>;
}
export { LoadTester, LoadTestResult };
