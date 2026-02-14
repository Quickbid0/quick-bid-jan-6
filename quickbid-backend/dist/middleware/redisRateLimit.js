"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
function rateLimit(keyGen, max, windowMs) {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        keyGenerator: (req) => {
            const k = keyGen(req);
            return k || req.ip || 'unknown';
        },
        message: { error: 'Too many requests, please try again later' },
    });
}
