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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayController = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
const microservices_1 = require("@nestjs/microservices");
const email_gateway_1 = require("../email/email.gateway");
let ApiGatewayController = class ApiGatewayController {
    constructor(redisService, emailGateway) {
        this.redisService = redisService;
        this.emailGateway = emailGateway;
        this.client = microservices_1.ClientProxyFactory.create({
            transport: microservices_1.Transport.REDIS,
            options: { host: 'localhost', port: 6379 },
        });
    }
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
        }
        catch (error) {
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
    async getEmailById(emailId) {
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
        }
        catch (error) {
            return {
                status: 'error',
                error: error.message,
                emailId
            };
        }
    }
    async getEmailsByUsername(username) {
        try {
            const emails = await this.redisService.getEmailsForUsername(username);
            const count = await this.redisService.getEmailCount(username);
            return {
                status: 'ok',
                username,
                emails,
                count
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error.message,
                username
            };
        }
    }
    async getEmailCountByUsername(username) {
        try {
            const count = await this.redisService.getEmailCount(username);
            return {
                status: 'ok',
                username,
                count
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error.message,
                username
            };
        }
    }
    async getEmailIdsByUsername(username) {
        try {
            const emailIds = await this.redisService.getEmailIds(username);
            return {
                status: 'ok',
                username,
                emailIds,
                count: emailIds.length
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error.message,
                username
            };
        }
    }
    async storeEmailForUsername(username, emailData) {
        try {
            const emailId = await this.redisService.storeEmail(username, emailData);
            this.emailGateway.server.to(username).emit('new-email', Object.assign({ emailId }, emailData));
            return {
                status: 'ok',
                message: 'Email stored successfully',
                username,
                emailId,
                email: emailData
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error.message,
                username
            };
        }
    }
    async removeEmail(username, emailId) {
        try {
            await this.redisService.removeEmail(username, emailId);
            return {
                status: 'ok',
                message: 'Email removed successfully',
                username,
                emailId
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error.message,
                username,
                emailId
            };
        }
    }
    async cleanupExpiredEmails(username) {
        try {
            await this.redisService.cleanupExpiredEmails(username);
            return {
                status: 'ok',
                message: 'Expired emails cleaned up',
                username
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error.message,
                username
            };
        }
    }
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
        }
        catch (error) {
            return {
                status: 'error',
                message: 'WebSocket gateway error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    async processEmailsForUsername(username) {
        console.log('processEmailsForUsername triggered for username:', username);
        try {
            const emails = await this.redisService.getEmailsForUsername(username);
            console.log(`Found ${emails.length} emails for username: ${username}`);
            if (emails.length > 0) {
                const mostRecentEmail = emails.sort((a, b) => new Date(b.received).getTime() - new Date(a.received).getTime())[0];
                console.log('Most recent email:', mostRecentEmail);
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
            }
            else {
                console.log('No emails found for username:', username);
                return {
                    message: 'No emails found for this username',
                    username,
                    totalEmails: 0
                };
            }
        }
        catch (error) {
            console.error('Error in processEmailsForUsername:', error);
            return {
                message: 'Email processing failed',
                username,
                error: error.message
            };
        }
    }
    async getEmail(emailId) {
        console.log('getEmail subscribed (legacy)', emailId);
        return this.redisService.getEmail(emailId) || {};
    }
    async addEmailToList(body) {
        try {
            await this.redisService.addEmailToList(body.emailId, body.email);
            const length = await this.redisService.getEmailListLength(body.emailId);
            return {
                status: 'ok',
                message: 'Email added to list (legacy method)',
                emailId: body.emailId,
                listLength: length
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error.message
            };
        }
    }
    async getEmailList(emailId) {
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
        }
        catch (error) {
            return {
                status: 'error',
                error: error.message
            };
        }
    }
    async getEmailListCount(emailId) {
        try {
            const length = await this.redisService.getEmailListLength(emailId);
            return {
                status: 'ok',
                emailId,
                count: length,
                note: 'Using legacy method'
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error.message
            };
        }
    }
};
exports.ApiGatewayController = ApiGatewayController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)('id/:emailId'),
    __param(0, (0, common_1.Param)('emailId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "getEmailById", null);
__decorate([
    (0, common_1.Get)('username/:username'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "getEmailsByUsername", null);
__decorate([
    (0, common_1.Get)('username/:username/count'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "getEmailCountByUsername", null);
__decorate([
    (0, common_1.Get)('username/:username/ids'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "getEmailIdsByUsername", null);
__decorate([
    (0, common_1.Post)('username/:username/store'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "storeEmailForUsername", null);
__decorate([
    (0, common_1.Delete)('username/:username/email/:emailId'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Param)('emailId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "removeEmail", null);
__decorate([
    (0, common_1.Post)('username/:username/cleanup'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "cleanupExpiredEmails", null);
__decorate([
    (0, common_1.Get)('test/socket'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "testSocket", null);
__decorate([
    (0, common_1.Get)('test/websocket'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "testWebSocket", null);
__decorate([
    (0, common_1.Get)(':username/process'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "processEmailsForUsername", null);
__decorate([
    (0, common_1.Get)(':emailId'),
    __param(0, (0, common_1.Param)('emailId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "getEmail", null);
__decorate([
    (0, common_1.Post)('list/add'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "addEmailToList", null);
__decorate([
    (0, common_1.Get)('list/:emailId'),
    __param(0, (0, common_1.Param)('emailId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "getEmailList", null);
__decorate([
    (0, common_1.Get)('list/:emailId/count'),
    __param(0, (0, common_1.Param)('emailId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "getEmailListCount", null);
exports.ApiGatewayController = ApiGatewayController = __decorate([
    (0, common_1.Controller)('email'),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        email_gateway_1.EmailGateway])
], ApiGatewayController);
//# sourceMappingURL=api-gateway.controller.js.map