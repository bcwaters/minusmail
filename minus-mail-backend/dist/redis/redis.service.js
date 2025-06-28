"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const redis_1 = require("redis");
const uuid_1 = require("uuid");
let RedisService = RedisService_1 = class RedisService {
    constructor() {
        this.logger = new common_1.Logger(RedisService_1.name);
        this.isConnected = false;
        this.TTL_SECONDS = 900;
    }
    async onModuleInit() {
        this.redisClient = (0, redis_1.createClient)({
            socket: {
                host: 'localhost',
                port: 6379,
            },
        });
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
        }
        catch (error) {
            this.logger.error('Failed to connect to Redis:', error);
            throw error;
        }
    }
    async storeEmail(username, emailData) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        const emailId = (0, uuid_1.v4)();
        const emailKey = `emails:${username}`;
        try {
            await this.redisClient.setEx(emailId, this.TTL_SECONDS, JSON.stringify(emailData));
            await this.redisClient.sAdd(emailKey, emailId);
            await this.redisClient.expire(emailKey, this.TTL_SECONDS);
            this.logger.log(`[REDIS] Email stored: ${emailId} for ${username}`);
            return emailId;
        }
        catch (error) {
            this.logger.error(`Failed to store email for username ${username}:`, error);
            throw error;
        }
    }
    async getEmail(emailId) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        try {
            const data = await this.redisClient.get(emailId);
            return data ? JSON.parse(data.toString()) : null;
        }
        catch (error) {
            this.logger.error(`Failed to get email ${emailId}:`, error);
            throw error;
        }
    }
    async getEmailIds(username) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        try {
            const emailKey = `emails:${username}`;
            const emailIds = await this.redisClient.sMembers(emailKey);
            if (Array.isArray(emailIds)) {
                return emailIds.map(id => String(id));
            }
            else {
                return Array.from(emailIds).map(id => String(id));
            }
        }
        catch (error) {
            this.logger.error(`Failed to get email IDs for username ${username}:`, error);
            throw error;
        }
    }
    async getEmailsForUsername(username) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        try {
            const emailIds = await this.getEmailIds(username);
            const emails = [];
            for (const emailId of emailIds) {
                const email = await this.getEmail(emailId);
                if (email) {
                    emails.push(email);
                }
            }
            this.logger.log(`[REDIS] Retrieved ${emails.length} emails for ${username}`);
            return emails;
        }
        catch (error) {
            this.logger.error(`Failed to get emails for username ${username}:`, error);
            throw error;
        }
    }
    async getEmailCount(username) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        try {
            const emailKey = `emails:${username}`;
            const count = await this.redisClient.sCard(emailKey);
            return Number(count);
        }
        catch (error) {
            this.logger.error(`Failed to get email count for username ${username}:`, error);
            throw error;
        }
    }
    async removeEmail(username, emailId) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        try {
            const emailKey = `emails:${username}`;
            await this.redisClient.sRem(emailKey, emailId);
            await this.redisClient.del(emailId);
            this.logger.log(`Email ${emailId} removed for username ${username}`);
        }
        catch (error) {
            this.logger.error(`Failed to remove email ${emailId} for username ${username}:`, error);
            throw error;
        }
    }
    async cleanupExpiredEmails(username) {
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
        }
        catch (error) {
            this.logger.error(`Failed to cleanup expired emails for username ${username}:`, error);
            throw error;
        }
    }
    async ping() {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        const result = await this.redisClient.ping();
        return String(result);
    }
    async getConnectionStatus() {
        try {
            if (!this.isConnected) {
                return { connected: false };
            }
            const ping = await this.redisClient.ping();
            return { connected: true, ping: String(ping) };
        }
        catch (error) {
            this.logger.error('Error getting Redis connection status:', error);
            return { connected: false };
        }
    }
    async testConnection() {
        try {
            const result = await this.ping();
            return result === 'PONG';
        }
        catch (error) {
            this.logger.error('Redis connection test failed:', error);
            return false;
        }
    }
    async setEmail(emailId, data, ttlSeconds = 600) {
        this.logger.warn('setEmail is deprecated, use storeEmail instead');
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        await this.redisClient.setEx(emailId, ttlSeconds, JSON.stringify(data));
    }
    async addEmailToList(emailId, emailData) {
        this.logger.warn('addEmailToList is deprecated, use storeEmail instead');
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        await this.redisClient.lPush(emailId, JSON.stringify(emailData));
    }
    async getEmailList(emailId) {
        this.logger.warn('getEmailList is deprecated, use getEmailsForUsername instead');
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        const emails = await this.redisClient.lRange(emailId, 0, -1);
        return emails.map(email => JSON.parse(String(email)));
    }
    async getEmailListLength(emailId) {
        this.logger.warn('getEmailListLength is deprecated, use getEmailCount instead');
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        const length = await this.redisClient.lLen(emailId);
        return Number(length);
    }
    async removeEmailFromList(emailId, emailData) {
        this.logger.warn('removeEmailFromList is deprecated, use removeEmail instead');
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        await this.redisClient.lRem(emailId, 1, JSON.stringify(emailData));
    }
    createSubscriber() {
        return (0, redis_1.createClient)({
            socket: {
                host: 'localhost',
                port: 6379,
            },
        });
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map