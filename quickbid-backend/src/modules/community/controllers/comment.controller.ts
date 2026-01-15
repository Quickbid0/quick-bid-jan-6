import { Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';
import { AuthedRequest } from '../../../middleware/authMiddleware';

export const listCommentsForPost = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const comments = await CommentService.listForPost(req.params.postId);
    res.json({ data: comments });
  } catch (err) {
    next(err);
  }
};

export const createComment = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { content } = req.body;
    const created = await CommentService.create(req.params.postId, req.user.id, content);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
};

export const updateComment = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { content } = req.body;
    const updated = await CommentService.update(req.params.commentId, req.user.id, content);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    await CommentService.remove(req.params.commentId, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
