"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
exports.WhatsappService = {
    async sendBroadcast(message, links) {
        // Stub implementation: log and return fake ID
        console.log('[WhatsappService] sendBroadcast', { message, links });
        return { messageId: 'whatsapp-mock-id' };
    },
};
