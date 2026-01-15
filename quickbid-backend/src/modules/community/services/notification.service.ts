import { Notification, NotificationType } from '../models/Notification';

export const NotificationService = {
  async listForUser(userId: string) {
    return Notification.find({ userId }).sort({ createdAt: -1 }).lean();
  },

  async markAllRead(userId: string) {
    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
  },

  async markOneRead(userId: string, notificationId: string) {
    await Notification.updateOne({ _id: notificationId, userId }, { $set: { isRead: true } });
  },

  async create(userId: string, type: NotificationType, data: Record<string, any>) {
    const doc = new Notification({ userId, type, data });
    return doc.save();
  },
};
