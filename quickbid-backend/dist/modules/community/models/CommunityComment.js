"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityComment = void 0;
const mongoose_1 = require("mongoose");
const CommunityCommentSchema = new mongoose_1.Schema({
    postId: { type: String, required: true, index: true },
    authorId: { type: String, required: true },
    content: { type: String, required: true },
    likeCount: { type: Number, default: 0 },
}, { timestamps: true });
exports.CommunityComment = (0, mongoose_1.model)('CommunityComment', CommunityCommentSchema);
