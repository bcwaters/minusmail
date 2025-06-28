import { OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
export declare class EmailProcessorService implements OnModuleInit {
    private readonly redisService;
    constructor(redisService: RedisService);
    onModuleInit(): void;
    processEmail(data: {
        emailId: string;
        useStub?: boolean;
    }): Promise<any>;
    getAllEmailsForUsername(username: string): Promise<any[]>;
    getEmailCount(username: string): Promise<number>;
}
