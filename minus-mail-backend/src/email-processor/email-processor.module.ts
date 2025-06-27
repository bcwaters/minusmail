// src/email-processor/email-processor.module.ts
import { Module } from '@nestjs/common';
import { EmailProcessorService } from './email-processor.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [EmailProcessorService],
  exports: [EmailProcessorService],
})
export class EmailProcessorModule {}