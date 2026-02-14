"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const Notification_1 = require("../models/Notification");
exports.NotificationService = {
    async listForUser(userId) {
        return Notification_1.Notification.find({ userId }).sort({ createdAt: -1 }).lean();
    },
    async markAllRead(userId) {
        await Notification_1.Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
    },
    async markOneRead(userId, notificationId) {
        await Notification_1.Notification.updateOne({ _id: notificationId, userId }, { $set: { isRead: true } });
    },
    async create(userId, type, data) {
        const doc = new Notification_1.Notification({ userId, type, data });
        return doc.save();
    },
};
