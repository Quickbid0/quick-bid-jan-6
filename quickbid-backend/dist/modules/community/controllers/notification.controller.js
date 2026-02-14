"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationRead = exports.markAllNotificationsRead = exports.listNotifications = void 0;
const notification_service_1 = require("../services/notification.service");
const listNotifications = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const notifications = await notification_service_1.NotificationService.listForUser(req.user.id);
        res.json({ data: notifications });
    }
    catch (err) {
        next(err);
    }
};
exports.listNotifications = listNotifications;
const markAllNotificationsRead = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await notification_service_1.NotificationService.markAllRead(req.user.id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.markAllNotificationsRead = markAllNotificationsRead;
const markNotificationRead = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await notification_service_1.NotificationService.markOneRead(req.user.id, req.params.notificationId);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.markNotificationRead = markNotificationRead;
