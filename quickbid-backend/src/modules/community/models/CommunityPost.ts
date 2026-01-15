import { Schema, model, Document } from 'mongoose';

export type CommunityCategory =
  | 'bikes'
  | 'cars'
  | 'antiques'
  | 'art'
  | 'handcrafts'
  | 'bidding-tips'
  | 'seller-stories';

export interface IMediaItem {
  url: string;
  type: 'image' | 'video';
}

export interface ICommunityPost extends Document {
  authorId: string;
  category: CommunityCategory;
  title?: string;
  content: string;
  media: IMediaItem[];
  tags: string[];
  isTrending: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const MediaItemSchema = new Schema<IMediaItem>(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
  },
  { _id: false }
);

const CommunityPostSchema = new Schema<ICommunityPost>(
  {
    authorId: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ['bikes', 'cars', 'antiques', 'art', 'handcrafts', 'bidding-tips', 'seller-stories'],
      required: true,
      index: true,
    },
    title: { type: String },
    content: { type: String, required: true },
    media: { type: [MediaItemSchema], default: [] },
    tags: { type: [String], default: [] },
    isTrending: { type: Boolean, default: false, index: true },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CommunityPost = model<ICommunityPost>('CommunityPost', CommunityPostSchema);
