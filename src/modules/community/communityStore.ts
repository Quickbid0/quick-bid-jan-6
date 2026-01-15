import { create } from 'zustand';
import { communityApi } from './communityApi';
import type {
  CommunityPost,
  CommunityComment,
  CommunityProfile,
  SocialGroupLink,
  NotificationDTO,
  FeedQuery,
  FollowEdge,
} from './communityApi';

interface FeedState {
  feedItems: CommunityPost[];
  feedTotal: number;
  feedLoading: boolean;
  feedError?: string;
  feedFilters: FeedQuery;

  loadFeed: (params?: FeedQuery) => Promise<void>;
  setFeedFilters: (partial: Partial<FeedQuery>) => void;
}

interface CurrentPostState {
  currentPost?: CommunityPost;
  currentPostLoading: boolean;
  currentPostError?: string;

  comments: CommunityComment[];
  commentsLoading: boolean;
  commentsError?: string;

  openPost: (postId: string) => Promise<void>;
  refreshComments: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  editComment: (commentId: string, content: string) => Promise<void>;
  removeComment: (commentId: string) => Promise<void>;
  toggleLike: (postId: string, liked: boolean) => Promise<void>;
  sharePost: (postId: string) => Promise<void>;
}

interface SocialLinksState {
  socialLinks: SocialGroupLink[];
  socialLinksLoading: boolean;
  socialLinksError?: string;

  loadSocialLinks: (params?: { platform?: string; tags?: string[]; visibleOnly?: boolean }) => Promise<void>;
}

interface ProfileState {
  profileLoading: boolean;
  profileError?: string;
  activeProfile?: CommunityProfile;

  profilePosts: CommunityPost[];
  profilePostsLoading: boolean;

  followers: FollowEdge[];
  following: FollowEdge[];

  loadProfile: (userId: string) => Promise<void>;
  loadProfilePosts: (userId: string) => Promise<void>;
  loadFollowers: (userId: string) => Promise<void>;
  loadFollowing: (userId: string) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
}

interface NotificationsState {
  notifications: NotificationDTO[];
  notificationsLoading: boolean;
  notificationsError?: string;
  unreadCount: number;

  loadNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markOneRead: (id: string) => Promise<void>;
}

interface AdminCommunityAnalyticsState {
  overview?: any;
  socialLinksAnalytics?: any;
  adminLoading: boolean;
  adminError?: string;

  loadOverview: () => Promise<void>;
  loadSocialLinksAnalytics: () => Promise<void>;
  sendWhatsappBroadcast: (message: string, links: string[]) => Promise<void>;
  sendTelegramBroadcast: (message: string, links: string[]) => Promise<void>;
}

export type CommunityStoreState = FeedState &
  CurrentPostState &
  SocialLinksState &
  ProfileState &
  NotificationsState &
  AdminCommunityAnalyticsState;

export const useCommunityStore = create<CommunityStoreState>((set, get) => ({
  // Feed
  feedItems: [],
  feedTotal: 0,
  feedLoading: false,
  feedError: undefined,
  feedFilters: { sort: 'latest' },

  async loadFeed(params) {
    set({ feedLoading: true, feedError: undefined });
    try {
      const merged = { ...get().feedFilters, ...(params || {}) };
      const { data, total } = await communityApi.getFeed(merged);
      set({ feedItems: data, feedTotal: total, feedFilters: merged, feedLoading: false });
    } catch (e: any) {
      set({ feedLoading: false, feedError: e?.message || 'Failed to load feed' });
    }
  },

  setFeedFilters(partial) {
    set((state) => ({ feedFilters: { ...state.feedFilters, ...partial } }));
  },

  // Current post & comments
  currentPost: undefined,
  currentPostLoading: false,
  currentPostError: undefined,
  comments: [],
  commentsLoading: false,
  commentsError: undefined,

  async openPost(postId) {
    set({ currentPostLoading: true, currentPostError: undefined });
    try {
      const post = await communityApi.getPost(postId);
      const comments = await communityApi.getComments(postId);
      set({ currentPost: post, comments, currentPostLoading: false });
    } catch (e: any) {
      set({ currentPostLoading: false, currentPostError: e?.message || 'Failed to load post' });
    }
  },

  async refreshComments(postId) {
    set({ commentsLoading: true, commentsError: undefined });
    try {
      const comments = await communityApi.getComments(postId);
      set({ comments, commentsLoading: false });
    } catch (e: any) {
      set({ commentsLoading: false, commentsError: e?.message || 'Failed to load comments' });
    }
  },

  async addComment(postId, content) {
    const created = await communityApi.createComment(postId, { content });
    set((state) => ({ comments: [...state.comments, created] }));
  },

  async editComment(commentId, content) {
    const updated = await communityApi.updateComment(commentId, { content });
    set((state) => ({
      comments: state.comments.map((c) => (c._id === commentId ? updated : c)),
    }));
  },

  async removeComment(commentId) {
    await communityApi.deleteComment(commentId);
    set((state) => ({ comments: state.comments.filter((c) => c._id !== commentId) }));
  },

  async toggleLike(postId, liked) {
    if (liked) {
      await communityApi.unlikePost(postId);
    } else {
      await communityApi.likePost(postId);
    }
    set((state) => ({
      currentPost:
        state.currentPost && state.currentPost._id === postId
          ? {
              ...state.currentPost,
              likeCount: state.currentPost.likeCount + (liked ? -1 : 1),
            }
          : state.currentPost,
    }));
  },

  async sharePost(postId) {
    await communityApi.sharePost(postId);
    set((state) => ({
      currentPost:
        state.currentPost && state.currentPost._id === postId
          ? { ...state.currentPost, shareCount: state.currentPost.shareCount + 1 }
          : state.currentPost,
    }));
  },

  // Social links
  socialLinks: [],
  socialLinksLoading: false,
  socialLinksError: undefined,

  async loadSocialLinks(params) {
    set({ socialLinksLoading: true, socialLinksError: undefined });
    try {
      const links = await communityApi.getSocialLinks(params);
      set({ socialLinks: links, socialLinksLoading: false });
    } catch (e: any) {
      set({ socialLinksLoading: false, socialLinksError: e?.message || 'Failed to load social links' });
    }
  },

  // Profile
  profileLoading: false,
  profileError: undefined,
  activeProfile: undefined,
  profilePosts: [],
  profilePostsLoading: false,
  followers: [],
  following: [],

  async loadProfile(userId) {
    set({ profileLoading: true, profileError: undefined });
    try {
      const profile = await communityApi.getProfile(userId);
      set({ activeProfile: profile, profileLoading: false });
    } catch (e: any) {
      set({ profileLoading: false, profileError: e?.message || 'Failed to load profile' });
    }
  },

  async loadProfilePosts(userId) {
    set({ profilePostsLoading: true });
    try {
      const posts = await communityApi.getProfilePosts(userId);
      set({ profilePosts: posts, profilePostsLoading: false });
    } catch (e) {
      set({ profilePostsLoading: false });
    }
  },

  async loadFollowers(userId) {
    try {
      const followers = await communityApi.getFollowers(userId);
      set({ followers });
    } catch (e) {
      // ignore, UI can handle
    }
  },

  async loadFollowing(userId) {
    try {
      const following = await communityApi.getFollowing(userId);
      set({ following });
    } catch (e) {
      // ignore, UI can handle
    }
  },

  async followUser(userId) {
    await communityApi.followUser(userId);
    // Optionally refresh profile/followers here if needed
  },

  async unfollowUser(userId) {
    await communityApi.unfollowUser(userId);
  },

  // Notifications
  notifications: [],
  notificationsLoading: false,
  notificationsError: undefined,
  unreadCount: 0,

  async loadNotifications() {
    set({ notificationsLoading: true, notificationsError: undefined });
    try {
      const items = await communityApi.getNotifications();
      const unreadCount = items.filter((n) => !n.isRead).length;
      set({ notifications: items, unreadCount, notificationsLoading: false });
    } catch (e: any) {
      set({ notificationsLoading: false, notificationsError: e?.message || 'Failed to load notifications' });
    }
  },

  async markAllRead() {
    await communityApi.markAllNotificationsRead();
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  async markOneRead(id) {
    await communityApi.markNotificationRead(id);
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      );
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      return { notifications, unreadCount };
    });
  },

  // Admin analytics
  overview: undefined,
  socialLinksAnalytics: undefined,
  adminLoading: false,
  adminError: undefined,

  async loadOverview() {
    set({ adminLoading: true, adminError: undefined });
    try {
      const overview = await communityApi.getCommunityOverviewAnalytics();
      set({ overview, adminLoading: false });
    } catch (e: any) {
      set({ adminLoading: false, adminError: e?.message || 'Failed to load community overview' });
    }
  },

  async loadSocialLinksAnalytics() {
    set({ adminLoading: true, adminError: undefined });
    try {
      const analytics = await communityApi.getSocialLinksAnalytics();
      set({ socialLinksAnalytics: analytics, adminLoading: false });
    } catch (e: any) {
      set({ adminLoading: false, adminError: e?.message || 'Failed to load social links analytics' });
    }
  },

  async sendWhatsappBroadcast(message, links) {
    await communityApi.sendWhatsappBroadcast({ message, links });
  },

  async sendTelegramBroadcast(message, links) {
    await communityApi.sendTelegramBroadcast({ message, links });
  },
}));
