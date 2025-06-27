// src/api-gateway/api-gateway.module.ts
import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { EmailModule } from '../email/email.module';
import { RedisModule } from '../redis/redis.module';
import { EmailProcessorModule } from '../email-processor/email-processor.module';

@Module({
  imports: [RedisModule, EmailProcessorModule, EmailModule],
  controllers: [ApiGatewayController],
})
export class ApiGatewayModule {}