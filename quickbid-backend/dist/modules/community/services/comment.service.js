"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const CommunityComment_1 = require("../models/CommunityComment");
const moderation_service_1 = require("../ai/moderation.service");
const CommunityPost_1 = require("../models/CommunityPost");
exports.CommentService = {
    async listForPost(postId) {
        return CommunityComment_1.CommunityComment.find({ postId }).sort({ createdAt: 1 }).lean();
    },
    async create(postId, authorId, content) {
        const moderation = moderation_service_1.ModerationService.checkContent(content);
        if (!moderation.isAllowed) {
            const error = new Error('Content rejected by moderation');
            error.statusCode = 400;
            error.reasons = moderation.reasons;
            throw error;
        }
        const doc = new CommunityComment_1.CommunityComment({ postId, authorId, content });
        await Promise.all([
            doc.save(),
            CommunityPost_1.CommunityPost.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } }),
        ]);
        return doc;
    },
    async update(commentId, authorId, content) {
        const comment = await CommunityComment_1.CommunityComment.findById(commentId);
        if (!comment) {
            const error = new Error('Comment not found');
            error.statusCode = 404;
            throw error;
        }
        if (comment.authorId !== authorId) {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }
        const moderation = moderation_service_1.ModerationService.checkContent(content);
        if (!moderation.isAllowed) {
            const error = new Error('Content rejected by moderation');
            error.statusCode = 400;
            error.reasons = moderation.reasons;
            throw error;
        }
        comment.content = content;
        return comment.save();
    },
    async remove(commentId, authorId) {
        const comment = await CommunityComment_1.CommunityComment.findById(commentId);
        if (!comment) {
            const error = new Error('Comment not found');
            error.statusCode = 404;
            throw error;
        }
        if (comment.authorId !== authorId) {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }
        await Promise.all([
            CommunityComment_1.CommunityComment.deleteOne({ _id: commentId }),
            CommunityPost_1.CommunityPost.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } }),
        ]);
    },
};
