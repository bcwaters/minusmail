// src/email-processor/email-processor.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { MessagePattern } from '@nestjs/microservices';

@Injectable()
export class EmailProcessorService {
  constructor(private readonly redisService: RedisService) {}

  @MessagePattern({ cmd: 'process-email' })
  async processEmail(emailId: string): Promise<any> {
    // Stubbed email data (mimics Postfix input)
    const email = {
      from: 'sender@example.com',
      subject: `Test Email for ${emailId}`,
      htmlBody: `<p>Hello, this is a <b>test email</b> for ${emailId}!</p>`,
      textBody: `Hello, this is a test email for ${emailId}!`,
      received: new Date().toISOString(),
    };
    await this.redisService.setEmail(emailId, email);
    return email;
  }
}