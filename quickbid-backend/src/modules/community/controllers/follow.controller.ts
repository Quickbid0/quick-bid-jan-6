import { Response, NextFunction } from 'express';
import { AuthedRequest } from '../../../middleware/authMiddleware';
import { FollowService } from '../services/follow.service';

export const followUser = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    await FollowService.follow(req.user.id, req.params.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const unfollowUser = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    await FollowService.unfollow(req.user.id, req.params.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
