// src/redis/redis.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';

export interface EmailData {
  id: string;
  from: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  received: string;
}

@Injectable()
export class RedisService implements OnModuleInit {
  private redisClient: ReturnType<typeof createClient>;
  private readonly logger = new Logger(RedisService.name);
  private isConnected = false;
  private readonly TTL_SECONDS = 900; // 15 minutes

  async onModuleInit() {
    this.redisClient = createClient({
      socket: {
        host: 'localhost',
        port: 6379,
      },
    });

    // Set up event listeners
    this.redisClient.on('connect', () => {
      this.logger.log('Redis client connected');
      this.isConnected = true;
    });

    this.redisClient.on('ready', () => {
      this.logger.log('Redis client ready');
    });

    this.redisClient.on('error', (err) => {
      this.logger.error('Redis client error:', err);
      this.isConnected = false;
    });

    this.redisClient.on('end', () => {
      this.logger.warn('Redis client disconnected');
      this.isConnected = false;
    });

    try {
      await this.redisClient.connect();
      this.logger.log('Redis connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Store an email with the new design pattern
   * @param username - The username part of the email address (e.g., 'test' for 'test@minusmail.com')
   * @param emailData - The email data to store
   * @returns The UUID of the stored email
   */
  async storeEmail(username: string, emailData: EmailData): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const emailId = uuidv4();
    const emailKey = `emails:${username}`;
    
    try {
      // Store the email as a JSON string with UUID key
      await this.redisClient.setEx(
        emailId, 
        this.TTL_SECONDS, 
        JSON.stringify(emailData)
      );

      // Add UUID to the set for this username
      await this.redisClient.sAdd(emailKey, emailId);
      
      // Set TTL for the set (refresh if it already exists)
      await this.redisClient.expire(emailKey, this.TTL_SECONDS);

      this.logger.log(`[REDIS] Email stored: ${emailId} for ${username}`);
      return emailId;
    } catch (error) {
      this.logger.error(`Failed to store email for username ${username}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve a specific email by its UUID
   * @param emailId - The UUID of the email
   * @returns The email data or null if not found
   */
  async getEmail(emailId: string): Promise<EmailData | null> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const data = await this.redisClient.get(emailId);
      const emailData = data ? JSON.parse(data.toString()) : null;
      
      if (emailData) {
        emailData.id = emailId;
      }
      
      return emailData;
    } catch (error) {
      this.logger.error(`Failed to get email ${emailId}:`, error);
      throw error;
    }
  }

  /**
   * Get all email UUIDs for a specific username
   * @param username - The username part of the email address
   * @returns Array of email UUIDs
   */
  async getEmailIds(username: string): Promise<string[]> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const emailKey = `emails:${username}`;
      const emailIds = await this.redisClient.sMembers(emailKey);
      
      // Handle both array and Set return types
      if (Array.isArray(emailIds)) {
        return emailIds.map(id => String(id));
      } else {
        return Array.from(emailIds).map(id => String(id));
      }
    } catch (error) {
      this.logger.error(`Failed to get email IDs for username ${username}:`, error);
      throw error;
    }
  }

  /**
   * Get all emails for a specific username
   * @param username - The username part of the email address
   * @returns Array of email data objects
   */
  async getEmailsForUsername(username: string): Promise<EmailData[]> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const emailIds = await this.getEmailIds(username);
      const emails: EmailData[] = [];

      for (const emailId of emailIds) {
        const email = await this.getEmail(emailId);
        if (email) {
          emails.push(email);
        }
      }

      this.logger.log(`[REDIS] Retrieved ${emails.length} emails for ${username}`);
      return emails;
    } catch (error) {
      this.logger.error(`Failed to get emails for username ${username}:`, error);
      throw error;
    }
  }

  /**
   * Get the count of emails for a specific username
   * @param username - The username part of the email address
   * @returns The number of emails
   */
  async getEmailCount(username: string): Promise<number> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const emailKey = `emails:${username}`;
      const count = await this.redisClient.sCard(emailKey);
      return Number(count);
    } catch (error) {
      this.logger.error(`Failed to get email count for username ${username}:`, error);
      throw error;
    }
  }

  /**
   * Remove a specific email by its UUID
   * @param username - The username part of the email address
   * @param emailId - The UUID of the email to remove
   */
  async removeEmail(username: string, emailId: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const emailKey = `emails:${username}`;
      
      // Remove from the set
      await this.redisClient.sRem(emailKey, emailId);
      
      // Delete the email data
      await this.redisClient.del(emailId);

      this.logger.log(`Email ${emailId} removed for username ${username}`);
    } catch (error) {
      this.logger.error(`Failed to remove email ${emailId} for username ${username}:`, error);
      throw error;
    }
  }

  /**
   * Clean up expired emails for a username
   * @param username - The username part of the email address
   */
  async cleanupExpiredEmails(username: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    try {
      const emailIds = await this.getEmailIds(username);
      const emailKey = `emails:${username}`;
      let removedCount = 0;

      for (const emailId of emailIds) {
        const exists = await this.redisClient.exists(emailId);
        if (!exists) {
          await this.redisClient.sRem(emailKey, emailId);
          removedCount++;
        }
      }

      if (removedCount > 0) {
        this.logger.log(`Cleaned up ${removedCount} expired emails for username ${username}`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup expired emails for username ${username}:`, error);
      throw error;
    }
  }

  async ping(): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    const result = await this.redisClient.ping();
    return String(result);
  }

  async getConnectionStatus(): Promise<{ connected: boolean; ping?: string }> {
    try {
      if (!this.isConnected) {
        return { connected: false };
      }
      
      const ping = await this.redisClient.ping();
      return { connected: true, ping: String(ping) };
    } catch (error) {
      this.logger.error('Error getting Redis connection status:', error);
      return { connected: false };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis connection test failed:', error);
      return false;
    }
  }

  // Legacy methods for backward compatibility (deprecated)
  async setEmail(emailId: string, data: any, ttlSeconds = 600): Promise<void> {
    this.logger.warn('setEmail is deprecated, use storeEmail instead');
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    await this.redisClient.setEx(emailId, ttlSeconds, JSON.stringify(data));
  }

  async addEmailToList(emailId: string, emailData: any): Promise<void> {
    this.logger.warn('addEmailToList is deprecated, use storeEmail instead');
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    await this.redisClient.lPush(emailId, JSON.stringify(emailData));
  }

  async getEmailList(emailId: string): Promise<any[]> {
    this.logger.warn('getEmailList is deprecated, use getEmailsForUsername instead');
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    const emails = await this.redisClient.lRange(emailId, 0, -1);
    return emails.map(email => JSON.parse(String(email)));
  }

  async getEmailListLength(emailId: string): Promise<number> {
    this.logger.warn('getEmailListLength is deprecated, use getEmailCount instead');
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    const length = await this.redisClient.lLen(emailId);
    return Number(length);
  }

  async removeEmailFromList(emailId: string, emailData: any): Promise<void> {
    this.logger.warn('removeEmailFromList is deprecated, use removeEmail instead');
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    await this.redisClient.lRem(emailId, 1, JSON.stringify(emailData));
  }

  /**
   * Create a Redis subscriber client for listening to notifications
   * @returns Redis subscriber client
   */
  createSubscriber() {
    return createClient({
      socket: {
        host: 'localhost',
        port: 6379,
      },
    });
  }
}