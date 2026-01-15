import axios from 'axios';

// Base API instance (assumes Vite dev proxy or same origin backend)
const api = axios.create({
  baseURL: '/',
  withCredentials: true,
});

export type CommunityCategory =
  | 'bikes'
  | 'cars'
  | 'antiques'
  | 'art'
  | 'handcrafts'
  | 'bidding-tips'
  | 'seller-stories';

export type MediaType = 'image' | 'video';

export interface MediaItem {
  url: string;
  type: MediaType;
}

export interface CommunityPost {
  _id: string;
  authorId: string;
  category: CommunityCategory;
  title?: string;
  content: string;
  media: MediaItem[];
  tags: string[];
  isTrending: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostPayload {
  category: CommunityCategory;
  title?: string;
  content: string;
  media?: MediaItem[];
  tags?: string[];
}

export interface UpdatePostPayload {
  category?: CommunityCategory;
  title?: string;
  content?: string;
  media?: MediaItem[];
  tags?: string[];
}

export interface CommunityComment {
  _id: string;
  postId: string;
  authorId: string;
  content: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentPayload {
  content: string;
}

export type SocialPlatform =
  | 'whatsapp'
  | 'telegram'
  | 'facebook'
  | 'linkedin'
  | 'x';

export type SocialLinkType = 'group' | 'channel' | 'page' | 'community';

export interface SocialGroupLink {
  _id: string;
  platform: SocialPlatform;
  type: SocialLinkType;
  name: string;
  url: string;
  tags: string[];
  isVisible: boolean;
  clickCount: number;
  joinCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertSocialLinkPayload {
  platform: SocialPlatform;
  type: SocialLinkType;
  name: string;
  url: string;
  tags?: string[];
  isVisible?: boolean;
}

export interface CommunityProfile {
  _id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  isVerifiedSeller: boolean;
  badges: string[];
  followersCount: number;
  followingCount: number;
  reputationPoints: number;
  followedCategoryIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FollowEdge {
  _id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface NotificationDTO {
  _id: string;
  userId: string;
  type: 'NEW_POST_IN_CATEGORY' | 'POST_LIKE' | 'POST_COMMENT' | 'NEW_AUCTION_EVENT';
  data: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedQuery {
  category?: CommunityCategory;
  tags?: string[];
  sort?: 'latest' | 'trending';
  limit?: number;
  offset?: number;
}

const buildFeedQuery = (params: FeedQuery) => {
  const search = new URLSearchParams();
  if (params.category) search.set('category', params.category);
  if (params.tags && params.tags.length) search.set('tags', params.tags.join(','));
  if (params.sort) search.set('sort', params.sort);
  if (typeof params.limit === 'number') search.set('limit', String(params.limit));
  if (typeof params.offset === 'number') search.set('offset', String(params.offset));
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

export const communityApi = {
  // Feed & posts
  async getFeed(params: FeedQuery = {}): Promise<{ data: CommunityPost[]; total: number }> {
    const qs = buildFeedQuery(params);
    const res = await api.get(`/api/community/feed${qs}`);
    return { data: res.data.data as CommunityPost[], total: res.data.total as number };
  },

  async getPost(postId: string): Promise<CommunityPost> {
    const res = await api.get(`/api/community/posts/${postId}`);
    return res.data.data as CommunityPost;
  },

  async createPost(payload: CreatePostPayload): Promise<CommunityPost> {
    const res = await api.post('/api/community/posts', payload);
    return res.data.data as CommunityPost;
  },

  async updatePost(postId: string, payload: UpdatePostPayload): Promise<CommunityPost> {
    const res = await api.put(`/api/community/posts/${postId}`, payload);
    return res.data.data as CommunityPost;
  },

  async deletePost(postId: string): Promise<void> {
    await api.delete(`/api/community/posts/${postId}`);
  },

  async likePost(postId: string): Promise<void> {
    await api.post(`/api/community/posts/${postId}/like`);
  },

  async unlikePost(postId: string): Promise<void> {
    await api.delete(`/api/community/posts/${postId}/like`);
  },

  async sharePost(postId: string): Promise<void> {
    await api.post(`/api/community/posts/${postId}/share`);
  },

  // Comments
  async getComments(postId: string): Promise<CommunityComment[]> {
    const res = await api.get(`/api/community/posts/${postId}/comments`);
    return res.data.data as CommunityComment[];
  },

  async createComment(postId: string, payload: CreateCommentPayload): Promise<CommunityComment> {
    const res = await api.post(`/api/community/posts/${postId}/comments`, payload);
    return res.data.data as CommunityComment;
  },

  async updateComment(commentId: string, payload: CreateCommentPayload): Promise<CommunityComment> {
    const res = await api.put(`/api/community/comments/${commentId}`, payload);
    return res.data.data as CommunityComment;
  },

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/api/community/comments/${commentId}`);
  },

  // Social links
  async getSocialLinks(params?: {
    platform?: SocialPlatform;
    tags?: string[];
    visibleOnly?: boolean;
  }): Promise<SocialGroupLink[]> {
    const search = new URLSearchParams();
    if (params?.platform) search.set('platform', params.platform);
    if (params?.tags && params.tags.length) search.set('tags', params.tags.join(','));
    if (typeof params?.visibleOnly === 'boolean') search.set('visibleOnly', String(params.visibleOnly));
    const qs = search.toString();
    const res = await api.get(`/api/community/social-links${qs ? `?${qs}` : ''}`);
    return res.data.data as SocialGroupLink[];
  },

  async createSocialLink(payload: UpsertSocialLinkPayload): Promise<SocialGroupLink> {
    const res = await api.post('/api/community/social-links', payload);
    return res.data.data as SocialGroupLink;
  },

  async updateSocialLink(id: string, payload: UpsertSocialLinkPayload): Promise<SocialGroupLink> {
    const res = await api.put(`/api/community/social-links/${id}`, payload);
    return res.data.data as SocialGroupLink;
  },

  async toggleSocialLinkVisibility(id: string, isVisible: boolean): Promise<SocialGroupLink> {
    const res = await api.patch(`/api/community/social-links/${id}/visibility`, { isVisible });
    return res.data.data as SocialGroupLink;
  },

  async trackSocialClick(id: string): Promise<void> {
    await api.post(`/api/community/social-links/${id}/click`);
  },

  async trackSocialJoin(id: string): Promise<void> {
    await api.post(`/api/community/social-links/${id}/join`);
  },

  // Profiles & follows
  async getProfile(userId: string): Promise<CommunityProfile> {
    const res = await api.get(`/api/community/profile/${userId}`);
    return res.data.data as CommunityProfile;
  },

  async getProfilePosts(userId: string): Promise<CommunityPost[]> {
    const res = await api.get(`/api/community/profile/${userId}/posts`);
    return res.data.data as CommunityPost[];
  },

  async getFollowers(userId: string): Promise<FollowEdge[]> {
    const res = await api.get(`/api/community/profile/${userId}/followers`);
    return res.data.data as FollowEdge[];
  },

  async getFollowing(userId: string): Promise<FollowEdge[]> {
    const res = await api.get(`/api/community/profile/${userId}/following`);
    return res.data.data as FollowEdge[];
  },

  async followUser(userId: string): Promise<void> {
    await api.post(`/api/community/profile/${userId}/follow`);
  },

  async unfollowUser(userId: string): Promise<void> {
    await api.delete(`/api/community/profile/${userId}/follow`);
  },

  // Notifications
  async getNotifications(): Promise<NotificationDTO[]> {
    const res = await api.get('/api/community/notifications');
    return res.data.data as NotificationDTO[];
  },

  async markAllNotificationsRead(): Promise<void> {
    await api.post('/api/community/notifications/mark-read');
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    await api.post(`/api/community/notifications/${notificationId}/mark-read`);
  },

  // Admin
  async getCommunityOverviewAnalytics(): Promise<any> {
    const res = await api.get('/api/admin/community/analytics/overview');
    return res.data.data;
  },

  async getSocialLinksAnalytics(): Promise<any> {
    const res = await api.get('/api/admin/community/analytics/social-links');
    return res.data.data;
  },

  async sendWhatsappBroadcast(input: { message: string; links: string[] }): Promise<{ messageId: string }> {
    const res = await api.post('/api/admin/community/broadcast/whatsapp', input);
    return res.data.data as { messageId: string };
  },

  async sendTelegramBroadcast(input: { message: string; links: string[] }): Promise<{ messageId: string }> {
    const res = await api.post('/api/admin/community/broadcast/telegram', input);
    return res.data.data as { messageId: string };
  },
};
