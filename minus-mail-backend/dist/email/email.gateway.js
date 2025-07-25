"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const email_processor_service_1 = require("../email-processor/email-processor.service");
const redis_service_1 = require("../redis/redis.service");
let EmailGateway = class EmailGateway {
    constructor(emailProcessorService, redisService) {
        this.emailProcessorService = emailProcessorService;
        this.redisService = redisService;
    }
    async onModuleInit() {
        console.log('=== EMAIL GATEWAY: Initializing ===');
        this.setupRedisSubscription().catch(error => {
            console.error('Failed to setup Redis subscription, but continuing:', error);
        });
    }
    async setupRedisSubscription() {
        try {
            console.log('[GATEWAY] Setting up Redis subscription');
            this.redisSubscriber = this.redisService.createSubscriber();
            await this.redisSubscriber.connect();
            console.log('[GATEWAY] Redis subscriber connected');
            await this.redisSubscriber.subscribe('new-email', (message) => {
                try {
                    const data = JSON.parse(message);
                    console.log('[GATEWAY] Redis notification received for:', data.username);
                    this.server.to(data.username).emit('new-email', data.email);
                    console.log(`[GATEWAY] Emitted email to room: ${data.username}`);
                }
                catch (error) {
                    console.error('[GATEWAY] Error processing Redis notification:', error);
                }
            });
            console.log('[GATEWAY] Redis subscription ready');
        }
        catch (error) {
            console.error('[GATEWAY] Redis subscription failed:', error);
        }
    }
    handleConnection(client) {
        console.log('=== CLIENT CONNECTED ===');
        console.log('Client ID:', client.id);
        console.log('Client transport:', client.conn.transport.name);
        console.log('Total connected clients:', this.server.sockets.sockets.size);
        console.log('Server ready state:', this.server.engine.clientsCount);
    }
    handleDisconnect(client) {
        console.log('=== CLIENT DISCONNECTED ===');
        console.log('Client ID:', client.id);
        console.log('Total connected clients:', this.server.sockets.sockets.size);
        console.log('Server ready state:', this.server.engine.clientsCount);
    }
    async handleJoin(client, emailId) {
        console.log('[GATEWAY] Join request:', client.id, '->', emailId);
        client.join(emailId);
        console.log('[GATEWAY] Client joined room:', emailId);
        try {
            const email = await this.emailProcessorService.processEmail({ emailId });
            if (email) {
                console.log('[GATEWAY] Emitting existing email to:', emailId);
                this.server.to(emailId).emit('new-email', email);
            }
            else {
                console.log('[GATEWAY] No emails found, sending welcome to:', emailId);
                const welcomeEmail = {
                    id: emailId,
                    from: 'system@minusmail.com',
                    subject: 'Welcome to MinusMail',
                    htmlBody: '<p>Welcome to your temporary email inbox! Any emails sent to <b>' + emailId + '@minusmail.com</b> will appear here.</p>',
                    textBody: 'Welcome to your temporary email inbox! Any emails sent to ' + emailId + '@minusmail.com will appear here.',
                    received: new Date().toISOString(),
                };
                this.server.to(emailId).emit('new-email', welcomeEmail);
            }
        }
        catch (error) {
            console.error('[GATEWAY] Error in join handler:', error);
            const fallbackEmail = {
                id: emailId,
                from: 'system@minusmail.com',
                subject: 'Welcome to MinusMail',
                htmlBody: '<p>Welcome to your temporary email inbox! Any emails sent to <b>' + emailId + '@minusmail.com</b> will appear here.</p>',
                textBody: 'Welcome to your temporary email inbox! Any emails sent to ' + emailId + '@minusmail.com will appear here.',
                received: new Date().toISOString(),
            };
            this.server.to(emailId).emit('new-email', fallbackEmail);
        }
    }
    async handleTriggerEmail(client, emailId) {
        console.log('Manual email trigger requested for:', emailId);
        try {
            const email = await this.emailProcessorService.processEmail({ emailId });
            if (email) {
                console.log('Email found and emitted to room:', emailId);
                this.server.to(emailId).emit('new-email', email);
                return email;
            }
            else {
                console.log('No emails found for:', emailId);
                return { message: 'No emails found for this address' };
            }
        }
        catch (error) {
            console.error('Error processing email:', error);
            return { error: 'Failed to process email' };
        }
    }
    async handleTest(client, message) {
        console.log('Test message received from client:', client.id, message);
        return { message: 'Test response from server' };
    }
    async handlePing(client) {
        console.log('Ping received from client:', client.id);
        return { message: 'pong', timestamp: new Date().toISOString() };
    }
};
exports.EmailGateway = EmailGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EmailGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], EmailGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('trigger-email'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], EmailGateway.prototype, "handleTriggerEmail", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], EmailGateway.prototype, "handleTest", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], EmailGateway.prototype, "handlePing", null);
exports.EmailGateway = EmailGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['polling', 'websocket']
    }),
    __metadata("design:paramtypes", [email_processor_service_1.EmailProcessorService,
        redis_service_1.RedisService])
], EmailGateway);
//# sourceMappingURL=email.gateway.js.map