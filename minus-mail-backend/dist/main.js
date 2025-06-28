"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    console.log('Starting application...');
    app.enableCors({
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    });
    await app.listen(3005);
    console.log('API Gateway running on port 3005');
    console.log('WebSocket support enabled');
    console.log('CORS enabled for all origins');
}
bootstrap();
//# sourceMappingURL=main.js.map