import { Schema, model, Document } from 'mongoose';

export type SocialPlatform = 'whatsapp' | 'telegram' | 'facebook' | 'linkedin' | 'x';
export type SocialLinkType = 'group' | 'channel' | 'page' | 'community';

export interface ISocialGroupLink extends Document {
  platform: SocialPlatform;
  type: SocialLinkType;
  name: string;
  url: string;
  tags: string[];
  isVisible: boolean;
  clickCount: number;
  joinCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SocialGroupLinkSchema = new Schema<ISocialGroupLink>(
  {
    platform: {
      type: String,
      enum: ['whatsapp', 'telegram', 'facebook', 'linkedin', 'x'],
      required: true,
    },
    type: {
      type: String,
      enum: ['group', 'channel', 'page', 'community'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    joinCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const SocialGroupLink = model<ISocialGroupLink>('SocialGroupLink', SocialGroupLinkSchema);
