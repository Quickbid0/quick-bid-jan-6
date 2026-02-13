import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

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
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow server-to-server / Postman
      if (!origin) return callback(null, true);

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

    allowedHeaders: '*', // � TEMPORARY: Allow all headers to debug

    exposedHeaders: [
      'Authorization',
    ],
  });

  // Explicitly handle OPTIONS (extra safe for Railway)
  app.getHttpAdapter().getInstance().options('*', (req, res) => {
    res.sendStatus(200);
  });

  console.log('🚀 CORS CONFIG LOADED');

  /**
   * ========================================
   * SECURITY & BODY LIMITS
   * ========================================
   */

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

  app.useGlobalFilters(new AllExceptionsFilter());

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
  await app.listen(port);

  console.log(`🔥 Server running on port ${port}`);
}

bootstrap();
