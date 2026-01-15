import { Schema, model, Document } from 'mongoose';

export interface ICommunityComment extends Document {
  postId: string;
  authorId: string;
  content: string;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityCommentSchema = new Schema<ICommunityComment>(
  {
    postId: { type: String, required: true, index: true },
    authorId: { type: String, required: true },
    content: { type: String, required: true },
    likeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CommunityComment = model<ICommunityComment>('CommunityComment', CommunityCommentSchema);
