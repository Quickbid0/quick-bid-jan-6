import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { corsConfigDevelopment } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  // Enable CORS - Development Configuration
  app.enableCors(corsConfigDevelopment);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // forbidNonWhitelisted: true, // Temporarily disabled for debugging
      transform: true,
    }),
  );

  // Static files
  app.use('/assets', express.static(join(__dirname, 'assets')));

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('QuickBid API')
    .setDescription('QuickBid Auction Platform API')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('products')
    .addTag('auctions')
    .addTag('users')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4011;
  await app.listen(port);

  // Startup complete - server is running
}

bootstrap();
