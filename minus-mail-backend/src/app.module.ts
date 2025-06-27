// src/app.module.ts
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ApiGatewayModule } from './api-gateway/api-gateway.module';
import { EmailProcessorModule } from './email-processor/email-processor.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ApiGatewayModule,
    EmailProcessorModule,
  ],
})
export class AppModule {}