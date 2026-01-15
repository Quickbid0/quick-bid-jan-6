import { Router } from 'express';
import { requireAdmin, requireAuth } from '../../../middleware/authMiddleware';
import {
  getCommunityOverviewAnalytics,
  getSocialLinksAnalytics,
  sendWhatsappBroadcast,
  sendTelegramBroadcast,
} from '../controllers/admin.controller';

export const adminCommunityRouter = Router();

// All admin community routes require authenticated admin
adminCommunityRouter.use(requireAuth, requireAdmin);

adminCommunityRouter.get('/analytics/overview', getCommunityOverviewAnalytics);
adminCommunityRouter.get('/analytics/social-links', getSocialLinksAnalytics);
adminCommunityRouter.post('/broadcast/whatsapp', sendWhatsappBroadcast);
adminCommunityRouter.post('/broadcast/telegram', sendTelegramBroadcast);
