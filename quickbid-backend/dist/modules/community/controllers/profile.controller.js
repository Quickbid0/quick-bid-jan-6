"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFollowing = exports.getFollowers = exports.getProfilePosts = exports.getProfile = void 0;
const profile_service_1 = require("../services/profile.service");
const getProfile = async (req, res, next) => {
    try {
        const profile = await profile_service_1.ProfileService.getPublicProfile(req.params.userId);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json({ data: profile });
    }
    catch (err) {
        next(err);
    }
};
exports.getProfile = getProfile;
const getProfilePosts = async (req, res, next) => {
    try {
        const posts = await profile_service_1.ProfileService.listUserPosts(req.params.userId);
        res.json({ data: posts });
    }
    catch (err) {
        next(err);
    }
};
exports.getProfilePosts = getProfilePosts;
const getFollowers = async (req, res, next) => {
    try {
        const followers = await profile_service_1.ProfileService.listFollowers(req.params.userId);
        res.json({ data: followers });
    }
    catch (err) {
        next(err);
    }
};
exports.getFollowers = getFollowers;
const getFollowing = async (req, res, next) => {
    try {
        const following = await profile_service_1.ProfileService.listFollowing(req.params.userId);
        res.json({ data: following });
    }
    catch (err) {
        next(err);
    }
};
exports.getFollowing = getFollowing;
