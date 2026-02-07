import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsConfig = {
  // Development vs Production origins
  origin: (origin, callback) => {
    // Allow all origins in development for testing
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

    // Check if origin is in allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },

  // Allow credentials
  credentials: true,

  // Allowed methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Allowed headers
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

  // Exposed headers
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page'
  ],

  // Preflight cache duration
  optionsSuccessStatus: 200,

  // Maximum age for preflight requests
  maxAge: 86400, // 24 hours

  // Allow preflight requests
  preflightContinue: false
};

export const corsConfigStrict: CorsOptions = {
  ...corsConfig,
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

export const corsConfigDevelopment: CorsOptions = {
  origin: [
    'http://localhost:3021',
    'http://localhost:3024',
    'http://localhost:3025', // Add current frontend port
    'http://localhost:3026', // Add current frontend port
    'http://localhost:3028', // Add current frontend port
    'http://localhost:3029', // Add current frontend port
    'http://localhost:3000',
    'http://127.0.0.1:3021',
    'http://127.0.0.1:3024',
    'http://127.0.0.1:3025', // Add current frontend port
    'http://127.0.0.1:3026', // Add current frontend port
    'http://127.0.0.1:3028', // Add current frontend port
    'http://127.0.0.1:3029', // Add current frontend port
    'http://127.0.0.1:3000',
    'http://192.168.1.2:3028', // Add actual frontend network IP
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
