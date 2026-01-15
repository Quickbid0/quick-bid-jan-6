import { FilterQuery } from 'mongoose';
import { CommunityPost, CommunityCategory, ICommunityPost } from '../models/CommunityPost';
import { Reaction } from '../models/Reaction';
import { CommunityComment } from '../models/CommunityComment';
import { ModerationService } from '../ai/moderation.service';

export interface FeedFilter {
  category?: CommunityCategory;
  tags?: string[];
  sort?: 'latest' | 'trending';
}

export const PostService = {
  async getFeed(filter: FeedFilter, limit = 20, offset = 0) {
    const query: FilterQuery<ICommunityPost> = {};

    if (filter.category) {
      query.category = filter.category;
    }

    if (filter.tags && filter.tags.length) {
      query.tags = { $in: filter.tags };
    }

    let sort: any = { createdAt: -1 };
    if (filter.sort === 'trending') {
      sort = { isTrending: -1, likeCount: -1, commentCount: -1, createdAt: -1 };
    }

    const [items, total] = await Promise.all([
      CommunityPost.find(query).sort(sort).skip(offset).limit(limit).lean(),
      CommunityPost.countDocuments(query),
    ]);

    return { items, total };
  },

  async getById(id: string) {
    return CommunityPost.findById(id).lean();
  },

  async create(authorId: string, payload: Partial<ICommunityPost>) {
    const moderation = ModerationService.checkContent(payload.content || '');
    if (!moderation.isAllowed) {
      const error: any = new Error('Content rejected by moderation');
      error.statusCode = 400;
      error.reasons = moderation.reasons;
      throw error;
    }

    const doc = new CommunityPost({ ...payload, authorId });
    return doc.save();
  },

  async update(postId: string, authorId: string, payload: Partial<ICommunityPost>) {
    const post = await CommunityPost.findById(postId);
    if (!post) {
      const error: any = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    if (post.authorId !== authorId) {
      const error: any = new Error('Forbidden');
      error.statusCode = 403;
      throw error;
    }

    if (payload.content) {
      const moderation = ModerationService.checkContent(payload.content);
      if (!moderation.isAllowed) {
        const error: any = new Error('Content rejected by moderation');
        error.statusCode = 400;
        error.reasons = moderation.reasons;
        throw error;
      }
    }

    Object.assign(post, payload);
    return post.save();
  },

  async remove(postId: string, authorId: string) {
    const post = await CommunityPost.findById(postId);
    if (!post) {
      const error: any = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    if (post.authorId !== authorId) {
      const error: any = new Error('Forbidden');
      error.statusCode = 403;
      throw error;
    }

    await Promise.all([
      CommunityPost.deleteOne({ _id: postId }),
      Reaction.deleteMany({ postId }),
      CommunityComment.deleteMany({ postId }),
    ]);
  },

  async like(postId: string, userId: string) {
    await Reaction.updateOne({ postId, userId }, { $setOnInsert: { type: 'like' } }, { upsert: true });
    await CommunityPost.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });
  },

  async unlike(postId: string, userId: string) {
    const res = await Reaction.findOneAndDelete({ postId, userId });
    if (res) {
      await CommunityPost.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } });
    }
  },

  async incrementShare(postId: string) {
    await CommunityPost.findByIdAndUpdate(postId, { $inc: { shareCount: 1 } });
  },
};
