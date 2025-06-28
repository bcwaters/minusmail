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
exports.EmailProcessorService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
let EmailProcessorService = class EmailProcessorService {
    constructor(redisService) {
        this.redisService = redisService;
    }
    onModuleInit() {
        console.log('=== EMAIL PROCESSOR: Service initialized and ready to process emails ===');
    }
    async processEmail(data) {
        console.log('[PROCESSOR] processEmail called for:', data.emailId);
        try {
            const username = data.emailId.includes('@') ? data.emailId.split('@')[0] : data.emailId;
            console.log('[PROCESSOR] Processing username:', username);
            const emails = await this.redisService.getEmailsForUsername(username);
            console.log(`[PROCESSOR] Found ${emails.length} emails for ${username}`);
            if (emails.length > 0) {
                const mostRecentEmail = emails.sort((a, b) => new Date(b.received).getTime() - new Date(a.received).getTime())[0];
                console.log('[PROCESSOR] Returning most recent email');
                return mostRecentEmail;
            }
            else {
                console.log('[PROCESSOR] No emails found for', username);
                return null;
            }
        }
        catch (error) {
            console.error('[PROCESSOR] Error processing email:', error);
            throw error;
        }
    }
    async getAllEmailsForUsername(username) {
        try {
            console.log(`Getting all emails for username: ${username}`);
            const emails = await this.redisService.getEmailsForUsername(username);
            console.log(`Found ${emails.length} emails for username: ${username}`);
            return emails;
        }
        catch (error) {
            console.error(`Error getting emails for username ${username}:`, error);
            throw error;
        }
    }
    async getEmailCount(username) {
        try {
            console.log(`Getting email count for username: ${username}`);
            const count = await this.redisService.getEmailCount(username);
            console.log(`Email count for ${username}: ${count}`);
            return count;
        }
        catch (error) {
            console.error(`Error getting email count for username ${username}:`, error);
            throw error;
        }
    }
};
exports.EmailProcessorService = EmailProcessorService;
exports.EmailProcessorService = EmailProcessorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], EmailProcessorService);
//# sourceMappingURL=email-processor.service.js.map