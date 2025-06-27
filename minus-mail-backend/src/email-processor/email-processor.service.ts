import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { MessagePattern } from '@nestjs/microservices';

@Injectable()
export class EmailProcessorService implements OnModuleInit {
  constructor(private readonly redisService: RedisService) {}

  onModuleInit() {
    console.log('=== EMAIL PROCESSOR: Service initialized and ready to receive messages ===');
  }

  @MessagePattern('*')
  async catchAll(pattern: any, data: any) {
    console.log('=== MICROSERVICE: Received ANY message ===');
    console.log('Pattern:', pattern);
    console.log('Data:', data);
    return { received: true, pattern, data };
  }

  @MessagePattern({ cmd: 'process-email' })
  async processEmail(data: { emailId: string; useStub?: boolean }): Promise<any> {
    console.log('=== MICROSERVICE: processEmail called ===');
    console.log('Received data:', data);
    console.log('EmailId:', data.emailId);
    
    const email = {
      from: 'sender@example.com',
      subject: 'Fixed Test Email',
      htmlBody: '<p>This is a <b>fixed stubbed email</b> for testing!</p>',
      textBody: 'This is a fixed stubbed email for testing!',
      received: new Date().toISOString(),
    };

    console.log('Created email object:', email);
    console.log('=== MICROSERVICE: Returning email ===');
    return email;
  }
}