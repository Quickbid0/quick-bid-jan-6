import { Response, NextFunction } from 'express';
import { PostService } from '../services/post.service';
import { AuthedRequest } from '../../../middleware/authMiddleware';

export const getFeed = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const { category, tags, sort, limit, offset } = req.query;
    const tagArray = typeof tags === 'string' ? tags.split(',') : undefined;

    const pageSize = limit ? parseInt(limit as string, 10) : 20;
    const skip = offset ? parseInt(offset as string, 10) : 0;

    const result = await PostService.getFeed(
      {
        category: category as any,
        tags: tagArray,
        sort: (sort as any) || 'latest',
      },
      pageSize,
      skip
    );

    res.json({ data: result.items, total: result.total });
  } catch (err) {
    next(err);
  }
};

export const getPostById = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const post = await PostService.getById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ data: post });
  } catch (err) {
    next(err);
  }
};

export const createPost = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const created = await PostService.create(req.user.id, req.body);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
};

export const updatePost = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updated = await PostService.update(req.params.postId, req.user.id, req.body);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    await PostService.remove(req.params.postId, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const likePost = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    await PostService.like(req.params.postId, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const unlikePost = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    await PostService.unlike(req.params.postId, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const sharePost = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    await PostService.incrementShare(req.params.postId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
