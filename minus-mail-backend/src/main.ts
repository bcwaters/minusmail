// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  console.log('Starting application...');
  
  app.enableCors({ 
    origin: '*',
    credentials: true 
  });
  
  await app.listen(3000);
  console.log('API Gateway running on port 3000');
  console.log('WebSocket support enabled');
}
bootstrap();