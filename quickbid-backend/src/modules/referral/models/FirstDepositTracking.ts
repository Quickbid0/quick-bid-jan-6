import { Schema, model, Document } from 'mongoose';

export interface FirstDepositTrackingDoc extends Document {
  userId: string;
  firstDepositAt?: Date;
  firstDepositAmount?: number;
  usedForBonus: boolean;
  referrerUserId?: string;
  source?: 'user' | 'agent';
}

const FirstDepositTrackingSchema = new Schema<FirstDepositTrackingDoc>(
  {
    userId: { type: String, required: true, unique: true },
    firstDepositAt: { type: Date },
    firstDepositAmount: { type: Number },
    usedForBonus: { type: Boolean, default: false },
    referrerUserId: { type: String },
    source: { type: String, enum: ['user', 'agent'] },
  },
  { timestamps: true }
);

export const FirstDepositTracking = model<FirstDepositTrackingDoc>(
  'FirstDepositTracking',
  FirstDepositTrackingSchema
);
