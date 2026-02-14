"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationService = void 0;
const PROFANITY_LIST = ['badword1', 'badword2'];
exports.ModerationService = {
    checkContent(text) {
        const lower = text.toLowerCase();
        const reasons = [];
        for (const word of PROFANITY_LIST) {
            if (lower.includes(word)) {
                reasons.push(`Contains banned term: ${word}`);
            }
        }
        return {
            isAllowed: reasons.length === 0,
            reasons,
        };
    },
};
