"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const CommunityProfile_1 = require("../models/CommunityProfile");
const Follow_1 = require("../models/Follow");
const CommunityPost_1 = require("../models/CommunityPost");
exports.ProfileService = {
    async getOrCreateByUserId(userId, username) {
        let profile = await CommunityProfile_1.CommunityProfile.findOne({ userId });
        if (!profile) {
            profile = new CommunityProfile_1.CommunityProfile({ userId, username: username || userId });
            await profile.save();
        }
        return profile;
    },
    async getPublicProfile(userId) {
        const profile = await CommunityProfile_1.CommunityProfile.findOne({ userId }).lean();
        if (!profile)
            return null;
        const followerCount = await Follow_1.Follow.countDocuments({ followingId: userId });
        const followingCount = await Follow_1.Follow.countDocuments({ followerId: userId });
        return {
            ...profile,
            followersCount: followerCount,
            followingCount,
        };
    },
    async listUserPosts(userId) {
        return CommunityPost_1.CommunityPost.find({ authorId: userId }).sort({ createdAt: -1 }).lean();
    },
    async listFollowers(userId) {
        return Follow_1.Follow.find({ followingId: userId }).lean();
    },
    async listFollowing(userId) {
        return Follow_1.Follow.find({ followerId: userId }).lean();
    },
};
