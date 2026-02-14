"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsConfigDevelopment = exports.corsConfigStrict = exports.corsConfig = void 0;
exports.corsConfig = {
    origin: (origin, callback) => {
        if (process.env.NODE_ENV === 'development') {
            callback(null, true);
            return;
        }
        const allowedOrigins = [
            'https://quickbid.com',
            'https://www.quickbid.com',
            'https://api.quickbid.com',
            'https://cdn.quickbid.com',
            'https://assets.quickbid.com',
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Credentials',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
        'X-Total-Count',
        'X-Page-Count',
        'X-Current-Page',
        'X-Per-Page'
    ],
    exposedHeaders: [
        'X-Total-Count',
        'X-Page-Count',
        'X-Current-Page',
        'X-Per-Page'
    ],
    optionsSuccessStatus: 200,
    maxAge: 86400,
    preflightContinue: false
};
exports.corsConfigStrict = {
    ...exports.corsConfig,
    origin: [
        'https://quickbid.com',
        'https://www.quickbid.com',
        'https://api.quickbid.com',
        'https://cdn.quickbid.com',
        'https://assets.quickbid.com'
    ],
    maxAge: 86400,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-Total-Count',
        'X-Page-Count',
        'X-Current-Page',
        'X-Per-Page'
    ],
    exposedHeaders: [
        'X-Total-Count',
        'X-Page-Count',
        'X-Current-Page',
        'X-Per-Page'
    ]
};
exports.corsConfigDevelopment = {
    origin: [
        'http://localhost:3021',
        'http://localhost:3024',
        'http://localhost:3025',
        'http://localhost:3026',
        'http://localhost:3028',
        'http://localhost:3029',
        'http://localhost:3000',
        'http://127.0.0.1:3021',
        'http://127.0.0.1:3024',
        'http://127.0.0.1:3025',
        'http://127.0.0.1:3026',
        'http://127.0.0.1:3028',
        'http://127.0.0.1:3029',
        'http://127.0.0.1:3000',
        'http://192.168.1.2:3028',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: '*',
    exposedHeaders: [
        'X-Total-Count',
        'X-Page-Count',
        'X-Current-Page',
        'X-Per-Page'
    ]
};
//# sourceMappingURL=cors.config.js.map