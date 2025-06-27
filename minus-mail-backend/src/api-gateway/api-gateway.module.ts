// src/api-gateway/api-gateway.module.ts
import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { EmailGateway } from '../email/email.gateway';
import { RedisModule } from '../redis/redis.module';
import { EmailProcessorModule } from '../email-processor/email-processor.module';

@Module({
  imports: [RedisModule, EmailProcessorModule],
  controllers: [ApiGatewayController],
  providers: [EmailGateway],
})
export class ApiGatewayModule {}