"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialGroupLink = void 0;
const mongoose_1 = require("mongoose");
const SocialGroupLinkSchema = new mongoose_1.Schema({
    platform: {
        type: String,
        enum: ['whatsapp', 'telegram', 'facebook', 'linkedin', 'x'],
        required: true,
    },
    type: {
        type: String,
        enum: ['group', 'channel', 'page', 'community'],
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    url: {
        type: String,
        required: true,
        trim: true,
    },
    tags: {
        type: [String],
        default: [],
    },
    isVisible: {
        type: Boolean,
        default: true,
    },
    clickCount: {
        type: Number,
        default: 0,
    },
    joinCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
exports.SocialGroupLink = (0, mongoose_1.model)('SocialGroupLink', SocialGroupLinkSchema);
