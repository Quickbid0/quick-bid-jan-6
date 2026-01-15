import { Request, Response, NextFunction } from 'express';
import { SocialLinkService } from '../services/socialLink.service';
import { CommunityPost } from '../models/CommunityPost';
import { Follow } from '../models/Follow';
import { WhatsappService } from '../integrations/whatsapp.service';
import { TelegramService } from '../integrations/telegram.service';

export const getCommunityOverviewAnalytics = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [postCount, userFollowCount, socialLinkAnalytics] = await Promise.all([
      CommunityPost.countDocuments({}),
      Follow.countDocuments({}),
      SocialLinkService.analytics(),
    ]);

    res.json({
      data: {
        totalPosts: postCount,
        totalFollows: userFollowCount,
        socialLinks: socialLinkAnalytics,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getSocialLinksAnalytics = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const analytics = await SocialLinkService.analytics();
    res.json({ data: analytics });
  } catch (err) {
    next(err);
  }
};

export const sendWhatsappBroadcast = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, links } = req.body as { message: string; links: string[] };
    const result = await WhatsappService.sendBroadcast(message, links || []);
    res.status(202).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const sendTelegramBroadcast = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, links } = req.body as { message: string; links: string[] };
    const result = await TelegramService.sendBroadcast(message, links || []);
    res.status(202).json({ data: result });
  } catch (err) {
    next(err);
  }
};
