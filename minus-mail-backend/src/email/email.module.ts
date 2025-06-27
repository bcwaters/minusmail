import { Module } from '@nestjs/common';
import { EmailGateway } from './email.gateway';
import { EmailProcessorModule } from '../email-processor/email-processor.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [EmailProcessorModule, RedisModule],
  providers: [EmailGateway],
  exports: [EmailGateway],
})
export class EmailModule {} 