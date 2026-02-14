"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityProfile = void 0;
const mongoose_1 = require("mongoose");
const CommunityProfileSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    avatarUrl: { type: String },
    isVerifiedSeller: { type: Boolean, default: false },
    badges: { type: [String], default: [] },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    reputationPoints: { type: Number, default: 0 },
    followedCategoryIds: { type: [String], default: [] },
}, { timestamps: true });
exports.CommunityProfile = (0, mongoose_1.model)('CommunityProfile', CommunityProfileSchema);
