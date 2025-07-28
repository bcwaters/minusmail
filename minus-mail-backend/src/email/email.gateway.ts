import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { EmailProcessorService } from '../email-processor/email-processor.service';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway({ 
  cors: { 
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket']
})
export class EmailGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private redisSubscriber: any;

  constructor(
    private readonly emailProcessorService: EmailProcessorService,
    private readonly redisService: RedisService
  ) {}

  async onModuleInit() {
    console.log('=== EMAIL GATEWAY: Initializing ===');
    // Set up Redis subscription to listen for new emails (non-blocking)
    this.setupRedisSubscription().catch(error => {
      console.error('Failed to setup Redis subscription, but continuing:', error);
    });
  }

  private async setupRedisSubscription() {
    try {
      console.log('[GATEWAY] Setting up Redis subscription');
      // Create a Redis subscriber client
      this.redisSubscriber = this.redisService.createSubscriber();
      
      // Connect the subscriber
      await this.redisSubscriber.connect();
      console.log('[GATEWAY] Redis subscriber connected');
      
      // Subscribe to a channel for new email notifications
      await this.redisSubscriber.subscribe('new-email', (message: string) => {
        try {
          const data = JSON.parse(message);
          console.log('[GATEWAY] Redis notification received for:', data.username);
          
          // Ensure the email has an id field using the Redis-generated emailId
          if (data.email && !data.email.id) {
            data.email.id = data.emailId;
          }
          
          // Convert username to lowercase for consistency
          const normalizedUsername = data.username.toLowerCase();
          
          // Emit the new email to all clients in the username room
          this.server.to(normalizedUsername).emit('new-email', data.email);
          console.log(`[GATEWAY] Emitted email to room: ${normalizedUsername}`);
        } catch (error) {
          console.error('[GATEWAY] Error processing Redis notification:', error);
        }
      });

      console.log('[GATEWAY] Redis subscription ready');
    } catch (error) {
      console.error('[GATEWAY] Redis subscription failed:', error);
    }
  }

  handleConnection(client: Socket) {
    console.log('=== CLIENT CONNECTED ===');
    console.log('Client ID:', client.id);
    console.log('Client transport:', client.conn.transport.name);
    console.log('Total connected clients:', this.server.sockets.sockets.size);
    console.log('Server ready state:', this.server.engine.clientsCount);
  }

  handleDisconnect(client: Socket) {
    console.log('=== CLIENT DISCONNECTED ===');
    console.log('Client ID:', client.id);
    console.log('Total connected clients:', this.server.sockets.sockets.size);
    console.log('Server ready state:', this.server.engine.clientsCount);
  }

  @SubscribeMessage('join')
  async handleJoin(client: Socket, emailId: string) {
    console.log('[GATEWAY] Join request:', client.id, '->', emailId);

    // Convert emailId to lowercase for consistency
    const normalizedEmailId = emailId.toLowerCase();
    
    client.join(normalizedEmailId);
    console.log('[GATEWAY] Client joined room:', normalizedEmailId);
    
    try {
      // Process any existing emails for this emailId
      const email = await this.emailProcessorService.processEmail({ emailId: normalizedEmailId });
      
      if (email) {
        console.log('[GATEWAY] Emitting existing email to:', normalizedEmailId);
        this.server.to(normalizedEmailId).emit('new-email', email);
      } else {
        console.log('[GATEWAY] No emails found, sending welcome to:', normalizedEmailId);
        // Send welcome message for new email addresses
        const welcomeEmail = {
          id: normalizedEmailId,
          from: 'system@minusmail.com',
          subject: 'Welcome to MinusMail',
          htmlBody: '<p>Welcome to your temporary email inbox! Any emails sent to <b>' + normalizedEmailId + '@minusmail.com</b> will appear here.</p>',
          textBody: 'Welcome to your temporary email inbox! Any emails sent to ' + normalizedEmailId + '@minusmail.com will appear here.',
          received: new Date().toISOString(),
        };
        this.server.to(normalizedEmailId).emit('new-email', welcomeEmail);
      }
    } catch (error) {
      console.error('[GATEWAY] Error in join handler:', error);
      // Send a fallback email if service fails
      const fallbackEmail = {
        id: normalizedEmailId,
        from: 'system@minusmail.com',
        subject: 'Welcome to MinusMail',
        htmlBody: '<p>Welcome to your temporary email inbox! Any emails sent to <b>' + normalizedEmailId + '@minusmail.com</b> will appear here.</p>',
        textBody: 'Welcome to your temporary email inbox! Any emails sent to ' + normalizedEmailId + '@minusmail.com will appear here.',
        received: new Date().toISOString(),
      };
      this.server.to(normalizedEmailId).emit('new-email', fallbackEmail);
    }
  }

  @SubscribeMessage('trigger-email')
  async handleTriggerEmail(client: Socket, emailId: string) {
    console.log('Manual email trigger requested for:', emailId);
    
    // Convert emailId to lowercase for consistency
    const normalizedEmailId = emailId.toLowerCase();
    
    try {
      // Process emails for the given emailId
      const email = await this.emailProcessorService.processEmail({ emailId: normalizedEmailId });
      
      if (email) {
        console.log('Email found and emitted to room:', normalizedEmailId);
        this.server.to(normalizedEmailId).emit('new-email', email);
        return email;
      } else {
        console.log('No emails found for:', normalizedEmailId);
        return { message: 'No emails found for this address' };
      }
    } catch (error) {
      console.error('Error processing email:', error);
      return { error: 'Failed to process email' };
    }
  }

  @SubscribeMessage('test')
  async handleTest(client: Socket, message: string) {
    console.log('Test message received from client:', client.id, message);
    return { message: 'Test response from server' };
  }

  @SubscribeMessage('ping')
  async handlePing(client: Socket) {
    console.log('Ping received from client:', client.id);
    return { message: 'pong', timestamp: new Date().toISOString() };
  }
}