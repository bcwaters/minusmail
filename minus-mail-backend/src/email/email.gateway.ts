import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { EmailProcessorService } from '../email-processor/email-processor.service';

@WebSocketGateway({ 
  cors: { 
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket']
})
export class EmailGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly emailProcessorService: EmailProcessorService) {}

  handleConnection(client: Socket) {
    console.log('=== CLIENT CONNECTED ===');
    console.log('Client ID:', client.id);
    console.log('Client transport:', client.conn.transport.name);
    console.log('Total connected clients:', this.server.sockets.sockets.size);
  }

  handleDisconnect(client: Socket) {
    console.log('=== CLIENT DISCONNECTED ===');
    console.log('Client ID:', client.id);
    console.log('Total connected clients:', this.server.sockets.sockets.size);
  }

  @SubscribeMessage('join')
  async handleJoin(client: Socket, emailId: string) {
    console.log('=== JOIN REQUEST RECEIVED ===');
    console.log('Client ID:', client.id);
    console.log('Email ID:', emailId);
    console.log('Client transport:', client.conn.transport.name);

    client.join(emailId);
    console.log('Client joined room:', emailId);
    
    // Log room membership
    const room = this.server.sockets.adapter.rooms.get(emailId);
    console.log('Clients in room', emailId, ':', room ? room.size : 0);
    console.log('All rooms:', Array.from(this.server.sockets.adapter.rooms.keys()));
    
    try {
      // Use the integrated email processor service
      const email = await this.emailProcessorService.processEmail({ emailId, useStub: true });
      console.log('Email received from service:', email);
      console.log('Email type:', typeof email);
      console.log('Email keys:', Object.keys(email || {}));
      
      console.log('Emitting new-email to room:', emailId);
      this.server.to(emailId).emit('new-email', email);
      console.log('Emission completed');
    } catch (error) {
      console.error('Error processing email:', error);
      // Send a fallback email if service fails
      const fallbackEmail = {
        from: 'system@minusmail.com',
        subject: 'Welcome to MinusMail',
        htmlBody: '<p>Welcome to your temporary email inbox! Any emails sent to <b>' + emailId + '@minusmail.com</b> will appear here.</p>',
        textBody: 'Welcome to your temporary email inbox! Any emails sent to ' + emailId + '@minusmail.com will appear here.',
        received: new Date().toISOString(),
      };
      this.server.to(emailId).emit('new-email', fallbackEmail);
    }
  }

  @SubscribeMessage('trigger-email')
  async handleTriggerEmail(client: Socket, emailId: string) {
    console.log('Manual trigger requested for:', emailId);
    
    const testEmail = {
      from: 'test@example.com',
      subject: 'Manual Trigger Test',
      htmlBody: '<p>This is a <b>manual trigger test</b> email!</p>',
      textBody: 'This is a manual trigger test email!',
      received: new Date().toISOString(),
    };
    
    console.log('Emitting manual test email to room:', emailId);
    this.server.to(emailId).emit('new-email', testEmail);
    console.log('Manual emission completed');
    
    return testEmail;
  }

  @SubscribeMessage('test')
  async handleTest(client: Socket, message: string) {
    console.log('Test message received from client:', client.id, message);
    return { message: 'Test response from server' };
  }
}