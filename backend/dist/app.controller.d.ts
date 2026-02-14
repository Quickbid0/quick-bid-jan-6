export declare class AppController {
    getHealth(): {
        status: string;
        timestamp: string;
        service: string;
        environment: string;
    };
    getDetailedHealth(): {
        status: string;
        timestamp: string;
        service: string;
        environment: string;
        database: string;
    };
}
