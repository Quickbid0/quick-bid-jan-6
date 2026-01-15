import { Schema, model, Document } from 'mongoose';

export interface ICommunityProfile extends Document {
  userId: string;
  username: string;
  avatarUrl?: string;
  isVerifiedSeller: boolean;
  badges: string[];
  followersCount: number;
  followingCount: number;
  reputationPoints: number;
  followedCategoryIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CommunityProfileSchema = new Schema<ICommunityProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    avatarUrl: { type: String },
    isVerifiedSeller: { type: Boolean, default: false },
    badges: { type: [String], default: [] },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    reputationPoints: { type: Number, default: 0 },
    followedCategoryIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const CommunityProfile = model<ICommunityProfile>('CommunityProfile', CommunityProfileSchema);
