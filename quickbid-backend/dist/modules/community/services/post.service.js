"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const CommunityPost_1 = require("../models/CommunityPost");
const Reaction_1 = require("../models/Reaction");
const CommunityComment_1 = require("../models/CommunityComment");
const moderation_service_1 = require("../ai/moderation.service");
exports.PostService = {
    async getFeed(filter, limit = 20, offset = 0) {
        const query = {};
        if (filter.category) {
            query.category = filter.category;
        }
        if (filter.tags && filter.tags.length) {
            query.tags = { $in: filter.tags };
        }
        let sort = { createdAt: -1 };
        if (filter.sort === 'trending') {
            sort = { isTrending: -1, likeCount: -1, commentCount: -1, createdAt: -1 };
        }
        const [items, total] = await Promise.all([
            CommunityPost_1.CommunityPost.find(query).sort(sort).skip(offset).limit(limit).lean(),
            CommunityPost_1.CommunityPost.countDocuments(query),
        ]);
        return { items, total };
    },
    async getById(id) {
        return CommunityPost_1.CommunityPost.findById(id).lean();
    },
    async create(authorId, payload) {
        const moderation = moderation_service_1.ModerationService.checkContent(payload.content || '');
        if (!moderation.isAllowed) {
            const error = new Error('Content rejected by moderation');
            error.statusCode = 400;
            error.reasons = moderation.reasons;
            throw error;
        }
        const doc = new CommunityPost_1.CommunityPost({ ...payload, authorId });
        return doc.save();
    },
    async update(postId, authorId, payload) {
        const post = await CommunityPost_1.CommunityPost.findById(postId);
        if (!post) {
            const error = new Error('Post not found');
            error.statusCode = 404;
            throw error;
        }
        if (post.authorId !== authorId) {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }
        if (payload.content) {
            const moderation = moderation_service_1.ModerationService.checkContent(payload.content);
            if (!moderation.isAllowed) {
                const error = new Error('Content rejected by moderation');
                error.statusCode = 400;
                error.reasons = moderation.reasons;
                throw error;
            }
        }
        Object.assign(post, payload);
        return post.save();
    },
    async remove(postId, authorId) {
        const post = await CommunityPost_1.CommunityPost.findById(postId);
        if (!post) {
            const error = new Error('Post not found');
            error.statusCode = 404;
            throw error;
        }
        if (post.authorId !== authorId) {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }
        await Promise.all([
            CommunityPost_1.CommunityPost.deleteOne({ _id: postId }),
            Reaction_1.Reaction.deleteMany({ postId }),
            CommunityComment_1.CommunityComment.deleteMany({ postId }),
        ]);
    },
    async like(postId, userId) {
        await Reaction_1.Reaction.updateOne({ postId, userId }, { $setOnInsert: { type: 'like' } }, { upsert: true });
        await CommunityPost_1.CommunityPost.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });
    },
    async unlike(postId, userId) {
        const res = await Reaction_1.Reaction.findOneAndDelete({ postId, userId });
        if (res) {
            await CommunityPost_1.CommunityPost.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } });
        }
    },
    async incrementShare(postId) {
        await CommunityPost_1.CommunityPost.findByIdAndUpdate(postId, { $inc: { shareCount: 1 } });
    },
};
