"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.createComment = exports.listCommentsForPost = void 0;
const comment_service_1 = require("../services/comment.service");
const listCommentsForPost = async (req, res, next) => {
    try {
        const comments = await comment_service_1.CommentService.listForPost(req.params.postId);
        res.json({ data: comments });
    }
    catch (err) {
        next(err);
    }
};
exports.listCommentsForPost = listCommentsForPost;
const createComment = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { content } = req.body;
        const created = await comment_service_1.CommentService.create(req.params.postId, req.user.id, content);
        res.status(201).json({ data: created });
    }
    catch (err) {
        next(err);
    }
};
exports.createComment = createComment;
const updateComment = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { content } = req.body;
        const updated = await comment_service_1.CommentService.update(req.params.commentId, req.user.id, content);
        res.json({ data: updated });
    }
    catch (err) {
        next(err);
    }
};
exports.updateComment = updateComment;
const deleteComment = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await comment_service_1.CommentService.remove(req.params.commentId, req.user.id);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteComment = deleteComment;
