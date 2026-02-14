"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookService = void 0;
exports.FacebookService = {
    async publishToPage(message, link) {
        // Stub implementation: log and return fake ID
        console.log('[FacebookService] publishToPage', { message, link });
        return { postId: 'facebook-mock-id' };
    },
};
