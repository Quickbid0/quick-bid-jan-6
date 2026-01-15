import { Response, NextFunction } from 'express';
import { AuthedRequest } from '../../../middleware/authMiddleware';
import { NotificationService } from '../services/notification.service';

export const listNotifications = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const notifications = await NotificationService.listForUser(req.user.id);
    res.json({ data: notifications });
  } catch (err) {
    next(err);
  }
};

export const markAllNotificationsRead = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    await NotificationService.markAllRead(req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    await NotificationService.markOneRead(req.user.id, req.params.notificationId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
