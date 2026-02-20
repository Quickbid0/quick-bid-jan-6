import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  // Set global API prefix
  app.setGlobalPrefix('api');
  
  // Add root endpoint that provides info
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/', (req: any, res: any) => {
    res.json({ 
      status: 'ok', 
      message: 'QuickMela API is running', 
      api: 'Use /api for API endpoints',
      timestamp: new Date().toISOString()
    });
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API endpoints available at: http://localhost:${port}/api`);
}
bootstrap();
