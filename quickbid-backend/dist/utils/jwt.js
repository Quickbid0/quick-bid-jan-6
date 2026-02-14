"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'quickbid-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET is not set; falling back to development secret');
}
const signToken = (payload, options) => {
    const signOptions = {
        expiresIn: JWT_EXPIRES_IN,
        ...(options ?? {}),
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, signOptions);
};
exports.signToken = signToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyToken = verifyToken;
