// src/email-processor/main.ts
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { EmailProcessorModule } from './email-processor.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(EmailProcessorModule, {
    transport: Transport.REDIS,
    options: {
      host: 'localhost',
      port: 6379,
    },
  });
  await app.listen();
  console.log('Email Processor Microservice running');
}
bootstrap();