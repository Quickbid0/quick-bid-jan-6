import { Schema, model, Document } from 'mongoose';

export type ReferralEventType = 'first_deposit' | 'first_bid';

export interface ReferralBonusHistoryDoc extends Document {
  referrerUserId: string;
  referredUserId: string;
  source: 'user' | 'agent';
  eventType: ReferralEventType;
  amount: number;
  currency: string;
  depositAmount?: number;
  bidId?: string;
  walletTransactionId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'frozen' | 'credited';
  approvalMode: 'auto' | 'manual';
  ruleId: Schema.Types.ObjectId;
  reason?: string;
  flaggedFraud?: boolean;
  fraudNotes?: string;
  deviceId?: string;
  ipAddress?: string;
  approvedBy?: string;
  frozenBy?: string;
}

const ReferralBonusHistorySchema = new Schema<ReferralBonusHistoryDoc>(
  {
    referrerUserId: { type: String, required: true, index: true },
    referredUserId: { type: String, required: true, index: true },
    source: { type: String, enum: ['user', 'agent'], required: true },
    eventType: { type: String, enum: ['first_deposit', 'first_bid'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    depositAmount: { type: Number },
    bidId: { type: String },
    walletTransactionId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'frozen', 'credited'],
      default: 'pending',
    },
    approvalMode: { type: String, enum: ['auto', 'manual'], required: true },
    ruleId: { type: Schema.Types.ObjectId, ref: 'ReferralBonusRule', required: true },
    reason: { type: String },
    flaggedFraud: { type: Boolean, default: false },
    fraudNotes: { type: String },
    deviceId: { type: String },
    ipAddress: { type: String },
    approvedBy: { type: String },
    frozenBy: { type: String },
  },
  { timestamps: true }
);

export const ReferralBonusHistory = model<ReferralBonusHistoryDoc>(
  'ReferralBonusHistory',
  ReferralBonusHistorySchema
);
