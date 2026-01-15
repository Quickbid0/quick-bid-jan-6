import { Follow } from '../models/Follow';
import { CommunityProfile } from '../models/CommunityProfile';

export const FollowService = {
  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) return;

    const created = await Follow.updateOne(
      { followerId, followingId },
      { $setOnInsert: { followerId, followingId } },
      { upsert: true }
    );

    if (created.upsertedCount) {
      await Promise.all([
        CommunityProfile.updateOne({ userId: followingId }, { $inc: { followersCount: 1 } }),
        CommunityProfile.updateOne({ userId: followerId }, { $inc: { followingCount: 1 } }),
      ]);
    }
  },

  async unfollow(followerId: string, followingId: string) {
    const res = await Follow.findOneAndDelete({ followerId, followingId });
    if (res) {
      await Promise.all([
        CommunityProfile.updateOne({ userId: followingId }, { $inc: { followersCount: -1 } }),
        CommunityProfile.updateOne({ userId: followerId }, { $inc: { followingCount: -1 } }),
      ]);
    }
  },
};
