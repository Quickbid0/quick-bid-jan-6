"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityPost = void 0;
const mongoose_1 = require("mongoose");
const MediaItemSchema = new mongoose_1.Schema({
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
}, { _id: false });
const CommunityPostSchema = new mongoose_1.Schema({
    authorId: { type: String, required: true, index: true },
    category: {
        type: String,
        enum: ['bikes', 'cars', 'antiques', 'art', 'handcrafts', 'bidding-tips', 'seller-stories'],
        required: true,
        index: true,
    },
    title: { type: String },
    content: { type: String, required: true },
    media: { type: [MediaItemSchema], default: [] },
    tags: { type: [String], default: [] },
    isTrending: { type: Boolean, default: false, index: true },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
}, { timestamps: true });
exports.CommunityPost = (0, mongoose_1.model)('CommunityPost', CommunityPostSchema);
