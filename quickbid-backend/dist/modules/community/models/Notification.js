"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    type: {
        type: String,
        enum: ['NEW_POST_IN_CATEGORY', 'POST_LIKE', 'POST_COMMENT', 'NEW_AUCTION_EVENT'],
        required: true,
    },
    data: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });
exports.Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
