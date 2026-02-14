"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Follow = void 0;
const mongoose_1 = require("mongoose");
const FollowSchema = new mongoose_1.Schema({
    followerId: { type: String, required: true, index: true },
    followingId: { type: String, required: true, index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
exports.Follow = (0, mongoose_1.model)('Follow', FollowSchema);
