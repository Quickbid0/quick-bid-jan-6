"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const auth_guard_1 = require("./auth.guard");
const roles_guard_1 = require("./roles.guard");
const csrf_guard_1 = require("./csrf.guard");
const email_module_1 = require("../email/email.module");
const prisma_module_1 = require("../prisma/prisma.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.register({
                privateKey: process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                publicKey: process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n'),
                signOptions: {
                    algorithm: 'RS256',
                    expiresIn: '1d',
                },
            }),
            email_module_1.EmailModule,
            prisma_module_1.PrismaModule,
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, csrf_guard_1.CsrfGuard],
        exports: [auth_service_1.AuthService, auth_guard_1.JwtAuthGuard],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map