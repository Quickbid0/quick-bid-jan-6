import { CommunityProfile, ICommunityProfile } from '../models/CommunityProfile';
import { Follow } from '../models/Follow';
import { CommunityPost } from '../models/CommunityPost';

export const ProfileService = {
  async getOrCreateByUserId(userId: string, username?: string): Promise<ICommunityProfile> {
    let profile = await CommunityProfile.findOne({ userId });
    if (!profile) {
      profile = new CommunityProfile({ userId, username: username || userId });
      await profile.save();
    }
    return profile;
  },

  async getPublicProfile(userId: string) {
    const profile = await CommunityProfile.findOne({ userId }).lean();
    if (!profile) return null;

    const followerCount = await Follow.countDocuments({ followingId: userId });
    const followingCount = await Follow.countDocuments({ followerId: userId });

    return {
      ...profile,
      followersCount: followerCount,
      followingCount,
    };
  },

  async listUserPosts(userId: string) {
    return CommunityPost.find({ authorId: userId }).sort({ createdAt: -1 }).lean();
  },

  async listFollowers(userId: string) {
    return Follow.find({ followingId: userId }).lean();
  },

  async listFollowing(userId: string) {
    return Follow.find({ followerId: userId }).lean();
  },
};
