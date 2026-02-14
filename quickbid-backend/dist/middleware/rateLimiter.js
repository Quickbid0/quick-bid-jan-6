"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitBids = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.rateLimitBids = (0, express_rate_limit_1.default)({
    windowMs: 10 * 1000,
    max: 10,
    message: { error: 'Too many bid attempts, please slow down' },
    keyGenerator: (req) => {
        const userId = req.user?.id;
        return userId || req.ip || 'unknown';
    },
});
