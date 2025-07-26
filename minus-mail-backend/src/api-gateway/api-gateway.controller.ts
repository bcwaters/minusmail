import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { RedisService, EmailData } from '../redis/redis.service';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { EmailGateway } from '../email/email.gateway';
import { timeout } from 'rxjs/operators';

@Controller('email')
export class ApiGatewayController {
  private client = ClientProxyFactory.create({
    transport: Transport.REDIS,
    options: { host: 'localhost', port: 6379 },
  });

  constructor(
    private readonly redisService: RedisService,
    private readonly emailGateway: EmailGateway,
  ) {}

  @Get('health')
  async healthCheck() {
    try {
      const redisStatus = await this.redisService.getConnectionStatus();
      const redisTest = await this.redisService.testConnection();
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          redis: {
            connected: redisStatus.connected,
            ping: redisStatus.ping,
            testPassed: redisTest
          }
        }
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        services: {
          redis: {
            connected: false,
            error: error.message
          }
        }
      };
    }
  }

  /**
   * Get a specific email by its UUID
   */
  @Get('id/:emailId')
  async getEmailById(@Param('emailId') emailId: string) {
    try {
      const email = await this.redisService.getEmail(emailId);
      if (!email) {
        return {
          status: 'not_found',
          message: 'Email not found',
          emailId
        };
      }
      return {
        status: 'ok',
        emailId,
        email
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        emailId
      };
    }
  }

  /**
   * Get all emails for a specific username
   */
  @Get('username/:username')
  async getEmailsByUsername(@Param('username') username: string) {
    try {
      const emails = await this.redisService.getEmailsForUsername(username);
      const count = await this.redisService.getEmailCount(username);
      
      return {
        status: 'ok',
        username,
        emails,
        count
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        username
      };
    }
  }

  /**
   * Get email count for a specific username
   */
  @Get('username/:username/count')
  async getEmailCountByUsername(@Param('username') username: string) {
    try {
      const count = await this.redisService.getEmailCount(username);
      return {
        status: 'ok',
        username,
        count
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        username
      };
    }
  }

  /**
   * Get email IDs for a specific username
   */
  @Get('username/:username/ids')
  async getEmailIdsByUsername(@Param('username') username: string) {
    try {
      const emailIds = await this.redisService.getEmailIds(username);
      return {
        status: 'ok',
        username,
        emailIds,
        count: emailIds.length
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        username
      };
    }
  }

  /**
   * Store a new email for a username
   */
  @Post('username/:username/store')
  async storeEmailForUsername(
    @Param('username') username: string,
    @Body() emailData: EmailData
  ) {
    try {
      const emailId = await this.redisService.storeEmail(username, emailData);
      
      // Emit to connected clients using the gateway
      this.emailGateway.server.to(username).emit('new-email', {
        id: emailId,
        ...emailData
      });

      return {
        status: 'ok',
        message: 'Email stored successfully',
        username,
        emailId,
        email: emailData
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        username
      };
    }
  }

  /**
   * Remove a specific email
   */
  @Delete('username/:username/email/:emailId')
  async removeEmail(
    @Param('username') username: string,
    @Param('emailId') emailId: string
  ) {
    try {
      await this.redisService.removeEmail(username, emailId);
      return {
        status: 'ok',
        message: 'Email removed successfully',
        username,
        emailId
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        username,
        emailId
      };
    }
  }

  /**
   * Clean up expired emails for a username
   */
  @Post('username/:username/cleanup')
  async cleanupExpiredEmails(@Param('username') username: string) {
    try {
      await this.redisService.cleanupExpiredEmails(username);
      return {
        status: 'ok',
        message: 'Expired emails cleaned up',
        username
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        username
      };
    }
  }

  @Get('test/socket')
  async testSocket() {
    console.log('Testing Socket.IO emission...');
    
    const testData = {
      message: 'Test from backend',
      timestamp: new Date().toISOString(),
      test: true
    };
    
    console.log('Emitting test event to all clients');
    this.emailGateway.server.emit('test-event', testData);
    console.log('Test emission completed');
    
    return { message: 'Test event emitted', data: testData };
  }

  @Get('test/websocket')
  async testWebSocket() {
    try {
      const server = this.emailGateway.server;
      const connectedClients = server.sockets.sockets.size;
      const engineClients = server.engine.clientsCount;
      
      return {
        status: 'ok',
        message: 'WebSocket gateway is running',
        connectedClients,
        engineClients,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'WebSocket gateway error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Process emails for a username (get most recent email)
   */
  @Get(':username/process')
  async processEmailsForUsername(@Param('username') username: string) {
    console.log('processEmailsForUsername triggered for username:', username);

    try {
      // Get all emails for this username
      const emails = await this.redisService.getEmailsForUsername(username);
      console.log(`Found ${emails.length} emails for username: ${username}`);

      if (emails.length > 0) {
        // Get the most recent email
        const mostRecentEmail = emails.sort((a, b) => 
          new Date(b.received).getTime() - new Date(a.received).getTime()
        )[0];

        console.log('Most recent email:', mostRecentEmail);

        // Emit to connected clients using the gateway
        console.log('About to emit to room:', username);
        console.log('Event name: new-email');
        console.log('Event data:', mostRecentEmail);
        
        this.emailGateway.server.to(username).emit('new-email', mostRecentEmail);
        console.log('Emitted email to room:', username);

        return { 
          message: 'Email processed successfully', 
          username, 
          email: mostRecentEmail,
          totalEmails: emails.length
        };
      } else {
        console.log('No emails found for username:', username);
        return { 
          message: 'No emails found for this username', 
          username, 
          totalEmails: 0
        };
      }
    } catch (error) {
      console.error('Error in processEmailsForUsername:', error);
      return { 
        message: 'Email processing failed', 
        username, 
        error: error.message 
      };
    }
  }

  // Legacy endpoints for backward compatibility (deprecated)
  @Get(':emailId')
  async getEmail(@Param('emailId') emailId: string) {
    console.log('getEmail subscribed (legacy)', emailId);
    return this.redisService.getEmail(emailId) || {};
  }

  @Post('list/add')
  async addEmailToList(@Body() body: { emailId: string, email: any }) {
    try {
      await this.redisService.addEmailToList(body.emailId, body.email);
      const length = await this.redisService.getEmailListLength(body.emailId);
      return { 
        status: 'ok', 
        message: 'Email added to list (legacy method)',
        emailId: body.emailId,
        listLength: length
      };
    } catch (error) {
      return { 
        status: 'error', 
        error: error.message 
      };
    }
  }

  @Get('list/:emailId')
  async getEmailList(@Param('emailId') emailId: string) {
    try {
      const emails = await this.redisService.getEmailList(emailId);
      const length = await this.redisService.getEmailListLength(emailId);
      return {
        status: 'ok',
        emailId,
        emails,
        count: length,
        note: 'Using legacy method'
      };
    } catch (error) {
      return { 
        status: 'error', 
        error: error.message 
      };
    }
  }

  @Get('status')
  async getStatus() {
    return {
      status: 'ok',
      message: 'MinusMail API is running'
    };
  }

  @Get('list/:emailId/count')
  async getEmailListCount(@Param('emailId') emailId: string) {
    try {
      const length = await this.redisService.getEmailListLength(emailId);
      return {
        status: 'ok',
        emailId,
        count: length,
        note: 'Using legacy method'
      };
    } catch (error) {
      return { 
        status: 'error', 
        error: error.message 
      };
    }
  }
}