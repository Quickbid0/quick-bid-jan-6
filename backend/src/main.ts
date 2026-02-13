import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔥 ENABLE CORS FIRST — BEFORE ANYTHING ELSE
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://quickmela.netlify.app',
        'http://localhost:3000',
        'http://localhost:5173',
      ];

      // Allow non-browser requests (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    exposedHeaders: 'Authorization',
  });

  console.log('🚀 CORS CONFIG LOADED');

  // Security: Disable x-powered-by
  // app.disable('x-powered-by');

  // Body size limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Global error filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Static files
  app.use('/assets', express.static(join(__dirname, 'assets')));

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger (optional in production)
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

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🔥 Server running on port ${port}`);
}

bootstrap();
