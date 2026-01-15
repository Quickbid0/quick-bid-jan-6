import { Response, NextFunction } from 'express';
import { AuthedRequest } from '../../../middleware/authMiddleware';
import { ProfileService } from '../services/profile.service';

export const getProfile = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await ProfileService.getPublicProfile(req.params.userId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json({ data: profile });
  } catch (err) {
    next(err);
  }
};

export const getProfilePosts = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const posts = await ProfileService.listUserPosts(req.params.userId);
    res.json({ data: posts });
  } catch (err) {
    next(err);
  }
};

export const getFollowers = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const followers = await ProfileService.listFollowers(req.params.userId);
    res.json({ data: followers });
  } catch (err) {
    next(err);
  }
};

export const getFollowing = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const following = await ProfileService.listFollowing(req.params.userId);
    res.json({ data: following });
  } catch (err) {
    next(err);
  }
};
