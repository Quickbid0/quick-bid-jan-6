import { FilterQuery } from 'mongoose';
import { ISocialGroupLink, SocialGroupLink, SocialPlatform } from '../models/SocialGroupLink';

export interface SocialLinkFilter {
  platform?: SocialPlatform;
  tags?: string[];
  visibleOnly?: boolean;
}

export const SocialLinkService = {
  async list(filter: SocialLinkFilter) {
    const query: FilterQuery<ISocialGroupLink> = {};

    if (filter.platform) {
      query.platform = filter.platform;
    }

    if (filter.visibleOnly) {
      query.isVisible = true;
    }

    if (filter.tags && filter.tags.length) {
      query.tags = { $in: filter.tags };
    }

    return SocialGroupLink.find(query).sort({ createdAt: -1 }).lean();
  },

  async create(payload: Partial<ISocialGroupLink>) {
    const doc = new SocialGroupLink(payload);
    return doc.save();
  },

  async update(id: string, payload: Partial<ISocialGroupLink>) {
    return SocialGroupLink.findByIdAndUpdate(id, payload, { new: true });
  },

  async toggleVisibility(id: string, isVisible: boolean) {
    return SocialGroupLink.findByIdAndUpdate(id, { isVisible }, { new: true });
  },

  async incrementClick(id: string) {
    return SocialGroupLink.findByIdAndUpdate(id, { $inc: { clickCount: 1 } }, { new: true });
  },

  async incrementJoin(id: string) {
    return SocialGroupLink.findByIdAndUpdate(id, { $inc: { joinCount: 1 } }, { new: true });
  },

  async analytics() {
    return SocialGroupLink.aggregate([
      {
        $group: {
          _id: { platform: '$platform', tag: '$tags' },
          totalClicks: { $sum: '$clickCount' },
          totalJoins: { $sum: '$joinCount' },
          count: { $sum: 1 },
        },
      },
    ]);
  },
};
