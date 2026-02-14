"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenaltyModule = void 0;
const common_1 = require("@nestjs/common");
const penalty_controller_1 = require("./penalty.controller");
const penalty_service_1 = require("./penalty.service");
let PenaltyModule = class PenaltyModule {
};
exports.PenaltyModule = PenaltyModule;
exports.PenaltyModule = PenaltyModule = __decorate([
    (0, common_1.Module)({
        controllers: [penalty_controller_1.PenaltyController],
        providers: [penalty_service_1.PenaltyService],
        exports: [penalty_service_1.PenaltyService],
    })
], PenaltyModule);
//# sourceMappingURL=penalty.module.js.map