"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const email_processor_module_1 = require("./email-processor.module");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(email_processor_module_1.EmailProcessorModule, {
        transport: microservices_1.Transport.REDIS,
        options: {
            host: 'localhost',
            port: 6379,
        },
    });
    await app.listen();
    console.log('Email Processor Microservice running');
}
bootstrap();
//# sourceMappingURL=main.js.map