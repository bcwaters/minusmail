import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class EmailProcessorService implements OnModuleInit {
  constructor(private readonly redisService: RedisService) {}

  onModuleInit() {
    console.log('=== EMAIL PROCESSOR: Service initialized and ready to process emails ===');
  }

  /**
   * Process emails for a specific email address
   * @param data - Object containing emailId and optional useStub flag
   * @returns The most recent email or null if none found
   */
  async processEmail(data: { emailId: string; useStub?: boolean }): Promise<any> {
    console.log('[PROCESSOR] processEmail called for:', data.emailId);
    
    try {
      // Extract username from emailId (handle both "test" and "test@minusmail.com")
      const username = data.emailId.includes('@') ? data.emailId.split('@')[0] : data.emailId;
      console.log('[PROCESSOR] Processing username:', username);
      
      // Get all emails for this username from Redis
      const emails = await this.redisService.getEmailsForUsername(username);
      console.log(`[PROCESSOR] Found ${emails.length} emails for ${username}`);
      
      if (emails.length > 0) {
        // Return the most recent email (assuming emails are ordered by received date)
        const mostRecentEmail = emails.sort((a, b) => 
          new Date(b.received).getTime() - new Date(a.received).getTime()
        )[0];
        
        console.log('[PROCESSOR] Returning most recent email');
        return mostRecentEmail;
      } else {
        console.log('[PROCESSOR] No emails found for', username);
        return null;
      }
    } catch (error) {
      console.error('[PROCESSOR] Error processing email:', error);
      throw error;
    }
  }

  /**
   * Get all emails for a specific username
   * @param username - The username part of the email address
   * @returns Array of email data objects
   */
  async getAllEmailsForUsername(username: string): Promise<any[]> {
    try {
      console.log(`Getting all emails for username: ${username}`);
      const emails = await this.redisService.getEmailsForUsername(username);
      console.log(`Found ${emails.length} emails for username: ${username}`);
      return emails;
    } catch (error) {
      console.error(`Error getting emails for username ${username}:`, error);
      throw error;
    }
  }

  /**
   * Get email count for a specific username
   * @param username - The username part of the email address
   * @returns The number of emails
   */
  async getEmailCount(username: string): Promise<number> {
    try {
      console.log(`Getting email count for username: ${username}`);
      const count = await this.redisService.getEmailCount(username);
      console.log(`Email count for ${username}: ${count}`);
      return count;
    } catch (error) {
      console.error(`Error getting email count for username ${username}:`, error);
      throw error;
    }
  }
}