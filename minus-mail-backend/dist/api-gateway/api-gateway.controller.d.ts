import { RedisService, EmailData } from '../redis/redis.service';
import { EmailGateway } from '../email/email.gateway';
export declare class ApiGatewayController {
    private readonly redisService;
    private readonly emailGateway;
    private client;
    constructor(redisService: RedisService, emailGateway: EmailGateway);
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
        services: {
            redis: {
                connected: boolean;
                ping: string;
                testPassed: boolean;
                error?: undefined;
            };
        };
        error?: undefined;
    } | {
        status: string;
        timestamp: string;
        error: any;
        services: {
            redis: {
                connected: boolean;
                error: any;
                ping?: undefined;
                testPassed?: undefined;
            };
        };
    }>;
    getEmailById(emailId: string): Promise<{
        status: string;
        message: string;
        emailId: string;
        email?: undefined;
        error?: undefined;
    } | {
        status: string;
        emailId: string;
        email: EmailData;
        message?: undefined;
        error?: undefined;
    } | {
        status: string;
        error: any;
        emailId: string;
        message?: undefined;
        email?: undefined;
    }>;
    getEmailsByUsername(username: string): Promise<{
        status: string;
        username: string;
        emails: EmailData[];
        count: number;
        error?: undefined;
    } | {
        status: string;
        error: any;
        username: string;
        emails?: undefined;
        count?: undefined;
    }>;
    getEmailCountByUsername(username: string): Promise<{
        status: string;
        username: string;
        count: number;
        error?: undefined;
    } | {
        status: string;
        error: any;
        username: string;
        count?: undefined;
    }>;
    getEmailIdsByUsername(username: string): Promise<{
        status: string;
        username: string;
        emailIds: string[];
        count: number;
        error?: undefined;
    } | {
        status: string;
        error: any;
        username: string;
        emailIds?: undefined;
        count?: undefined;
    }>;
    storeEmailForUsername(username: string, emailData: EmailData): Promise<{
        status: string;
        message: string;
        username: string;
        emailId: string;
        email: EmailData;
        error?: undefined;
    } | {
        status: string;
        error: any;
        username: string;
        message?: undefined;
        emailId?: undefined;
        email?: undefined;
    }>;
    removeEmail(username: string, emailId: string): Promise<{
        status: string;
        message: string;
        username: string;
        emailId: string;
        error?: undefined;
    } | {
        status: string;
        error: any;
        username: string;
        emailId: string;
        message?: undefined;
    }>;
    cleanupExpiredEmails(username: string): Promise<{
        status: string;
        message: string;
        username: string;
        error?: undefined;
    } | {
        status: string;
        error: any;
        username: string;
        message?: undefined;
    }>;
    testSocket(): Promise<{
        message: string;
        data: {
            message: string;
            timestamp: string;
            test: boolean;
        };
    }>;
    testWebSocket(): Promise<{
        status: string;
        message: string;
        connectedClients: number;
        engineClients: number;
        timestamp: string;
        error?: undefined;
    } | {
        status: string;
        message: string;
        error: any;
        timestamp: string;
        connectedClients?: undefined;
        engineClients?: undefined;
    }>;
    processEmailsForUsername(username: string): Promise<{
        message: string;
        username: string;
        email: EmailData;
        totalEmails: number;
        error?: undefined;
    } | {
        message: string;
        username: string;
        totalEmails: number;
        email?: undefined;
        error?: undefined;
    } | {
        message: string;
        username: string;
        error: any;
        email?: undefined;
        totalEmails?: undefined;
    }>;
    getEmail(emailId: string): Promise<{}>;
    addEmailToList(body: {
        emailId: string;
        email: any;
    }): Promise<{
        status: string;
        message: string;
        emailId: string;
        listLength: number;
        error?: undefined;
    } | {
        status: string;
        error: any;
        message?: undefined;
        emailId?: undefined;
        listLength?: undefined;
    }>;
    getEmailList(emailId: string): Promise<{
        status: string;
        emailId: string;
        emails: any[];
        count: number;
        note: string;
        error?: undefined;
    } | {
        status: string;
        error: any;
        emailId?: undefined;
        emails?: undefined;
        count?: undefined;
        note?: undefined;
    }>;
    getStatus(): Promise<{
        status: string;
        message: string;
    }>;
    getEmailListCount(emailId: string): Promise<{
        status: string;
        emailId: string;
        count: number;
        note: string;
        error?: undefined;
    } | {
        status: string;
        error: any;
        emailId?: undefined;
        count?: undefined;
        note?: undefined;
    }>;
}
