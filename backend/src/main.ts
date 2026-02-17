// IMPORTANT: Import instrument.ts BEFORE any other imports
// This ensures Sentry is initialized before NestJS application starts
import './instrument';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import helmet from 'helmet';

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * ========================================
   * 🔥 PRODUCTION-READY CORS CONFIG
   * ========================================
   */

  const allowedOrigins = [
    'https://quickmela.netlify.app',
    'https://quickmela.com',       // add your main domain
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5193',
    'http://localhost:5194',
    'http://localhost:5196',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow server-to-server / Postman
      if (!origin) return callback(null, true);

      // Allow all localhost origins for development
      if (origin.startsWith('http://localhost:')) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`),
        false,
      );
    },

    credentials: true,

    methods: [
      'GET',
      'HEAD',
      'PUT',
      'PATCH',
      'POST',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-csrf-token'
    ],

    exposedHeaders: [
      'Authorization',
    ],
  });

  // Explicitly handle OPTIONS (extra safe for Railway)
  app.getHttpAdapter().getInstance().options('*', (req, res) => {
    res.sendStatus(200);
  });

  // Security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  }));

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));

  /**
   * ========================================
   * GLOBAL VALIDATION
   * ========================================
   */

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  /**
   * ========================================
   * GLOBAL ERROR FILTER
   * ========================================
   */

  // app.useGlobalFilters(new AllExceptionsFilter());

  /**
   * ========================================
   * STATIC FILES
   * ========================================
   */

  app.use('/assets', express.static(join(__dirname, 'assets')));

  /**
   * ========================================
   * GLOBAL API PREFIX
   * ========================================
   */

  app.setGlobalPrefix('api');

  /**
   * ========================================
   * SWAGGER (Disable in production if needed)
   * ========================================
   */

  const config = new DocumentBuilder()
    .setTitle('QuickMela API')
    .setDescription('QuickMela Auction Platform API')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('products')
    .addTag('auctions')
    .addTag('users')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  /**
   * ========================================
   * START SERVER
   * ========================================
   */

  const port = process.env.PORT || 3000;

  // Debug: Log all registered routes
  const server = app.getHttpServer();
  console.log('Registered Routes:');
  server._events.request._router.stack
    .filter(r => r.route)
    .forEach(r => {
      console.log(Object.keys(r.route.methods)[0].toUpperCase(), r.route.path);
    });

  await app.listen(port);
}

bootstrap();
