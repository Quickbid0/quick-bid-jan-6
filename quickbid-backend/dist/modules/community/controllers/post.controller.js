"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharePost = exports.unlikePost = exports.likePost = exports.deletePost = exports.updatePost = exports.createPost = exports.getPostById = exports.getFeed = void 0;
const post_service_1 = require("../services/post.service");
const getFeed = async (req, res, next) => {
    try {
        const { category, tags, sort, limit, offset } = req.query;
        const tagArray = typeof tags === 'string' ? tags.split(',') : undefined;
        const pageSize = limit ? parseInt(limit, 10) : 20;
        const skip = offset ? parseInt(offset, 10) : 0;
        const result = await post_service_1.PostService.getFeed({
            category: category,
            tags: tagArray,
            sort: sort || 'latest',
        }, pageSize, skip);
        res.json({ data: result.items, total: result.total });
    }
    catch (err) {
        next(err);
    }
};
exports.getFeed = getFeed;
const getPostById = async (req, res, next) => {
    try {
        const post = await post_service_1.PostService.getById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ data: post });
    }
    catch (err) {
        next(err);
    }
};
exports.getPostById = getPostById;
const createPost = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const created = await post_service_1.PostService.create(req.user.id, req.body);
        res.status(201).json({ data: created });
    }
    catch (err) {
        next(err);
    }
};
exports.createPost = createPost;
const updatePost = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const updated = await post_service_1.PostService.update(req.params.postId, req.user.id, req.body);
        res.json({ data: updated });
    }
    catch (err) {
        next(err);
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await post_service_1.PostService.remove(req.params.postId, req.user.id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.deletePost = deletePost;
const likePost = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await post_service_1.PostService.like(req.params.postId, req.user.id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.likePost = likePost;
const unlikePost = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await post_service_1.PostService.unlike(req.params.postId, req.user.id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.unlikePost = unlikePost;
const sharePost = async (req, res, next) => {
    try {
        await post_service_1.PostService.incrementShare(req.params.postId);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.sharePost = sharePost;
