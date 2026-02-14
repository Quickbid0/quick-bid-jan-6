import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
export declare const corsConfig: {
    origin: (origin: any, callback: any) => void;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    optionsSuccessStatus: number;
    maxAge: number;
    preflightContinue: boolean;
};
export declare const corsConfigStrict: CorsOptions;
export declare const corsConfigDevelopment: CorsOptions;
