import { Schema, model, Document } from 'mongoose';

export interface FirstBidTrackingDoc extends Document {
  userId: string;
  firstBidAt?: Date;
  firstBidId?: string;
  usedForBonus: boolean;
  referrerUserId?: string;
  source?: 'user' | 'agent';
}

const FirstBidTrackingSchema = new Schema<FirstBidTrackingDoc>(
  {
    userId: { type: String, required: true, unique: true },
    firstBidAt: { type: Date },
    firstBidId: { type: String },
    usedForBonus: { type: Boolean, default: false },
    referrerUserId: { type: String },
    source: { type: String, enum: ['user', 'agent'] },
  },
  { timestamps: true }
);

export const FirstBidTracking = model<FirstBidTrackingDoc>(
  'FirstBidTracking',
  FirstBidTrackingSchema
);
