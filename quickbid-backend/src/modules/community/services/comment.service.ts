import { CommunityComment } from '../models/CommunityComment';
import { ModerationService } from '../ai/moderation.service';
import { CommunityPost } from '../models/CommunityPost';

export const CommentService = {
  async listForPost(postId: string) {
    return CommunityComment.find({ postId }).sort({ createdAt: 1 }).lean();
  },

  async create(postId: string, authorId: string, content: string) {
    const moderation = ModerationService.checkContent(content);
    if (!moderation.isAllowed) {
      const error: any = new Error('Content rejected by moderation');
      error.statusCode = 400;
      error.reasons = moderation.reasons;
      throw error;
    }

    const doc = new CommunityComment({ postId, authorId, content });
    await Promise.all([
      doc.save(),
      CommunityPost.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } }),
    ]);
    return doc;
  },

  async update(commentId: string, authorId: string, content: string) {
    const comment = await CommunityComment.findById(commentId);
    if (!comment) {
      const error: any = new Error('Comment not found');
      error.statusCode = 404;
      throw error;
    }
    if (comment.authorId !== authorId) {
      const error: any = new Error('Forbidden');
      error.statusCode = 403;
      throw error;
    }

    const moderation = ModerationService.checkContent(content);
    if (!moderation.isAllowed) {
      const error: any = new Error('Content rejected by moderation');
      error.statusCode = 400;
      error.reasons = moderation.reasons;
      throw error;
    }

    comment.content = content;
    return comment.save();
  },

  async remove(commentId: string, authorId: string) {
    const comment = await CommunityComment.findById(commentId);
    if (!comment) {
      const error: any = new Error('Comment not found');
      error.statusCode = 404;
      throw error;
    }
    if (comment.authorId !== authorId) {
      const error: any = new Error('Forbidden');
      error.statusCode = 403;
      throw error;
    }

    await Promise.all([
      CommunityComment.deleteOne({ _id: commentId }),
      CommunityPost.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } }),
    ]);
  },
};
