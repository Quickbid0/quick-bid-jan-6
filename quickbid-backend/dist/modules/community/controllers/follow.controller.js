"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unfollowUser = exports.followUser = void 0;
const follow_service_1 = require("../services/follow.service");
const followUser = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await follow_service_1.FollowService.follow(req.user.id, req.params.userId);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.followUser = followUser;
const unfollowUser = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await follow_service_1.FollowService.unfollow(req.user.id, req.params.userId);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.unfollowUser = unfollowUser;
