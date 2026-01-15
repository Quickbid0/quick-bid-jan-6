import { Schema, model, Document } from 'mongoose';

export interface IReaction extends Document {
  postId: string;
  userId: string;
  type: 'like';
  createdAt: Date;
}

const ReactionSchema = new Schema<IReaction>(
  {
    postId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['like'], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ReactionSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const Reaction = model<IReaction>('Reaction', ReactionSchema);
