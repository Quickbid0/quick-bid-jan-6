"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowService = void 0;
const Follow_1 = require("../models/Follow");
const CommunityProfile_1 = require("../models/CommunityProfile");
exports.FollowService = {
    async follow(followerId, followingId) {
        if (followerId === followingId)
            return;
        const created = await Follow_1.Follow.updateOne({ followerId, followingId }, { $setOnInsert: { followerId, followingId } }, { upsert: true });
        if (created.upsertedCount) {
            await Promise.all([
                CommunityProfile_1.CommunityProfile.updateOne({ userId: followingId }, { $inc: { followersCount: 1 } }),
                CommunityProfile_1.CommunityProfile.updateOne({ userId: followerId }, { $inc: { followingCount: 1 } }),
            ]);
        }
    },
    async unfollow(followerId, followingId) {
        const res = await Follow_1.Follow.findOneAndDelete({ followerId, followingId });
        if (res) {
            await Promise.all([
                CommunityProfile_1.CommunityProfile.updateOne({ userId: followingId }, { $inc: { followersCount: -1 } }),
                CommunityProfile_1.CommunityProfile.updateOne({ userId: followerId }, { $inc: { followingCount: -1 } }),
            ]);
        }
    },
};
