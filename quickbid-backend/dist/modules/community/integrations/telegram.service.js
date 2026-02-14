"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
exports.TelegramService = {
    async sendBroadcast(message, links) {
        // Stub implementation: log and return fake ID
        console.log('[TelegramService] sendBroadcast', { message, links });
        return { messageId: 'telegram-mock-id' };
    },
};
