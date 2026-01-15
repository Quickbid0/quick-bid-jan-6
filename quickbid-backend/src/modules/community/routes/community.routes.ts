import { Router } from 'express';
import {
  listSocialLinks,
  createSocialLink,
  updateSocialLink,
  toggleSocialLinkVisibility,
  trackSocialLinkClick,
  trackSocialLinkJoin,
  socialLinkAnalytics,
} from '../controllers/socialLink.controller';
import {
  getFeed,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  sharePost,
} from '../controllers/post.controller';
import {
  listCommentsForPost,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/comment.controller';
import {
  getProfile,
  getProfilePosts,
  getFollowers,
  getFollowing,
} from '../controllers/profile.controller';
import { followUser, unfollowUser } from '../controllers/follow.controller';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../controllers/notification.controller';
import { requireAuth } from '../../../middleware/authMiddleware';

export const communityRouter = Router();

// Social links public + admin
communityRouter.get('/social-links', listSocialLinks);
communityRouter.post('/social-links', requireAuth, createSocialLink);
communityRouter.put('/social-links/:id', requireAuth, updateSocialLink);
communityRouter.patch('/social-links/:id/visibility', requireAuth, toggleSocialLinkVisibility);
communityRouter.post('/social-links/:id/click', trackSocialLinkClick);
communityRouter.post('/social-links/:id/join', trackSocialLinkJoin);
communityRouter.get('/social-links/analytics', requireAuth, socialLinkAnalytics);

// Feed & posts
communityRouter.get('/feed', getFeed);
communityRouter.get('/posts/:postId', getPostById);
communityRouter.post('/posts', requireAuth, createPost);
communityRouter.put('/posts/:postId', requireAuth, updatePost);
communityRouter.delete('/posts/:postId', requireAuth, deletePost);
communityRouter.post('/posts/:postId/like', requireAuth, likePost);
communityRouter.delete('/posts/:postId/like', requireAuth, unlikePost);
communityRouter.post('/posts/:postId/share', sharePost);

// Comments
communityRouter.get('/posts/:postId/comments', listCommentsForPost);
communityRouter.post('/posts/:postId/comments', requireAuth, createComment);
communityRouter.put('/comments/:commentId', requireAuth, updateComment);
communityRouter.delete('/comments/:commentId', requireAuth, deleteComment);

// Profiles
communityRouter.get('/profile/:userId', getProfile);
communityRouter.get('/profile/:userId/posts', getProfilePosts);
communityRouter.get('/profile/:userId/followers', getFollowers);
communityRouter.get('/profile/:userId/following', getFollowing);
communityRouter.post('/profile/:userId/follow', requireAuth, followUser);
communityRouter.delete('/profile/:userId/follow', requireAuth, unfollowUser);

// Notifications
communityRouter.get('/notifications', requireAuth, listNotifications);
communityRouter.post('/notifications/mark-read', requireAuth, markAllNotificationsRead);
communityRouter.post('/notifications/:notificationId/mark-read', requireAuth, markNotificationRead);
