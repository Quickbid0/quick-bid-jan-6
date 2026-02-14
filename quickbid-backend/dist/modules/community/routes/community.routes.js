"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityRouter = void 0;
const express_1 = require("express");
const socialLink_controller_1 = require("../controllers/socialLink.controller");
const post_controller_1 = require("../controllers/post.controller");
const comment_controller_1 = require("../controllers/comment.controller");
const profile_controller_1 = require("../controllers/profile.controller");
const follow_controller_1 = require("../controllers/follow.controller");
const notification_controller_1 = require("../controllers/notification.controller");
const authMiddleware_1 = require("../../../middleware/authMiddleware");
exports.communityRouter = (0, express_1.Router)();
// Social links public + admin
exports.communityRouter.get('/social-links', socialLink_controller_1.listSocialLinks);
exports.communityRouter.post('/social-links', authMiddleware_1.requireAuth, socialLink_controller_1.createSocialLink);
exports.communityRouter.put('/social-links/:id', authMiddleware_1.requireAuth, socialLink_controller_1.updateSocialLink);
exports.communityRouter.patch('/social-links/:id/visibility', authMiddleware_1.requireAuth, socialLink_controller_1.toggleSocialLinkVisibility);
exports.communityRouter.post('/social-links/:id/click', socialLink_controller_1.trackSocialLinkClick);
exports.communityRouter.post('/social-links/:id/join', socialLink_controller_1.trackSocialLinkJoin);
exports.communityRouter.get('/social-links/analytics', authMiddleware_1.requireAuth, socialLink_controller_1.socialLinkAnalytics);
// Feed & posts
exports.communityRouter.get('/feed', post_controller_1.getFeed);
exports.communityRouter.get('/posts/:postId', post_controller_1.getPostById);
exports.communityRouter.post('/posts', authMiddleware_1.requireAuth, post_controller_1.createPost);
exports.communityRouter.put('/posts/:postId', authMiddleware_1.requireAuth, post_controller_1.updatePost);
exports.communityRouter.delete('/posts/:postId', authMiddleware_1.requireAuth, post_controller_1.deletePost);
exports.communityRouter.post('/posts/:postId/like', authMiddleware_1.requireAuth, post_controller_1.likePost);
exports.communityRouter.delete('/posts/:postId/like', authMiddleware_1.requireAuth, post_controller_1.unlikePost);
exports.communityRouter.post('/posts/:postId/share', post_controller_1.sharePost);
// Comments
exports.communityRouter.get('/posts/:postId/comments', comment_controller_1.listCommentsForPost);
exports.communityRouter.post('/posts/:postId/comments', authMiddleware_1.requireAuth, comment_controller_1.createComment);
exports.communityRouter.put('/comments/:commentId', authMiddleware_1.requireAuth, comment_controller_1.updateComment);
exports.communityRouter.delete('/comments/:commentId', authMiddleware_1.requireAuth, comment_controller_1.deleteComment);
// Profiles
exports.communityRouter.get('/profile/:userId', profile_controller_1.getProfile);
exports.communityRouter.get('/profile/:userId/posts', profile_controller_1.getProfilePosts);
exports.communityRouter.get('/profile/:userId/followers', profile_controller_1.getFollowers);
exports.communityRouter.get('/profile/:userId/following', profile_controller_1.getFollowing);
exports.communityRouter.post('/profile/:userId/follow', authMiddleware_1.requireAuth, follow_controller_1.followUser);
exports.communityRouter.delete('/profile/:userId/follow', authMiddleware_1.requireAuth, follow_controller_1.unfollowUser);
// Notifications
exports.communityRouter.get('/notifications', authMiddleware_1.requireAuth, notification_controller_1.listNotifications);
exports.communityRouter.post('/notifications/mark-read', authMiddleware_1.requireAuth, notification_controller_1.markAllNotificationsRead);
exports.communityRouter.post('/notifications/:notificationId/mark-read', authMiddleware_1.requireAuth, notification_controller_1.markNotificationRead);
