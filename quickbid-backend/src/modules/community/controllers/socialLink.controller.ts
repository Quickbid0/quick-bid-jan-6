import { Request, Response, NextFunction } from 'express';
import { SocialLinkService } from '../services/socialLink.service';

export const listSocialLinks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { platform, tags, visibleOnly } = req.query;
    const tagArray = typeof tags === 'string' ? tags.split(',') : undefined;

    const links = await SocialLinkService.list({
      platform: platform as any,
      tags: tagArray,
      visibleOnly: visibleOnly === 'true',
    });

    res.json({ data: links });
  } catch (err) {
    next(err);
  }
};

export const createSocialLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await SocialLinkService.create(req.body);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
};

export const updateSocialLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await SocialLinkService.update(req.params.id, req.body);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

export const toggleSocialLinkVisibility = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isVisible } = req.body;
    const updated = await SocialLinkService.toggleVisibility(req.params.id, Boolean(isVisible));
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

export const trackSocialLinkClick = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await SocialLinkService.incrementClick(req.params.id);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

export const trackSocialLinkJoin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await SocialLinkService.incrementJoin(req.params.id);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

export const socialLinkAnalytics = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await SocialLinkService.analytics();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};
