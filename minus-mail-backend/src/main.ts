// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  console.log('Starting application...');
  
  app.enableCors({ 
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });
  
  await app.listen(3005);
  console.log('API Gateway running on port 3005');
  console.log('WebSocket support enabled');
  console.log('CORS enabled for all origins');
}
bootstrap();