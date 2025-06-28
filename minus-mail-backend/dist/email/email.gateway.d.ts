import { Server, Socket } from 'socket.io';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { EmailProcessorService } from '../email-processor/email-processor.service';
import { RedisService } from '../redis/redis.service';
export declare class EmailGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    private readonly emailProcessorService;
    private readonly redisService;
    server: Server;
    private redisSubscriber;
    constructor(emailProcessorService: EmailProcessorService, redisService: RedisService);
    onModuleInit(): Promise<void>;
    private setupRedisSubscription;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoin(client: Socket, emailId: string): Promise<void>;
    handleTriggerEmail(client: Socket, emailId: string): Promise<any>;
    handleTest(client: Socket, message: string): Promise<{
        message: string;
    }>;
    handlePing(client: Socket): Promise<{
        message: string;
        timestamp: string;
    }>;
}
