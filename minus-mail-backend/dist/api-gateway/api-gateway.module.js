"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayModule = void 0;
const common_1 = require("@nestjs/common");
const api_gateway_controller_1 = require("./api-gateway.controller");
const email_module_1 = require("../email/email.module");
const redis_module_1 = require("../redis/redis.module");
const email_processor_module_1 = require("../email-processor/email-processor.module");
let ApiGatewayModule = class ApiGatewayModule {
};
exports.ApiGatewayModule = ApiGatewayModule;
exports.ApiGatewayModule = ApiGatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [redis_module_1.RedisModule, email_processor_module_1.EmailProcessorModule, email_module_1.EmailModule],
        controllers: [api_gateway_controller_1.ApiGatewayController],
    })
], ApiGatewayModule);
//# sourceMappingURL=api-gateway.module.js.map