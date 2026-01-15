import { Schema, model, Document } from 'mongoose';

export type ReferralRuleType =
  | 'first_deposit'
  | 'first_bid'
  | 'agent_first_deposit'
  | 'agent_first_bid';

export interface ReferralBonusRuleDoc extends Document {
  type: ReferralRuleType;
  isActive: boolean;
  minDepositAmount?: number;
  fixedBonusAmount?: number;
  percentageBonus?: number;
  maxBonusPerEvent?: number;
  slabs?: {
    minAmount: number;
    maxAmount?: number;
    fixedBonusAmount?: number;
    percentageBonus?: number;
    maxBonus?: number;
  }[];
  firstBidFixedBonus?: number;
  firstBidAgentBonus?: number;
  dailyCapPerReferrer?: number;
  weeklyCapPerReferrer?: number;
  monthlyCapPerReferrer?: number;
  autoCredit: boolean;
  createdBy: string;
  updatedBy?: string;
}

const ReferralBonusRuleSchema = new Schema<ReferralBonusRuleDoc>(
  {
    type: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    minDepositAmount: { type: Number },
    fixedBonusAmount: { type: Number },
    percentageBonus: { type: Number },
    maxBonusPerEvent: { type: Number },
    slabs: [
      {
        minAmount: { type: Number, required: true },
        maxAmount: { type: Number },
        fixedBonusAmount: { type: Number },
        percentageBonus: { type: Number },
        maxBonus: { type: Number },
      },
    ],
    firstBidFixedBonus: { type: Number },
    firstBidAgentBonus: { type: Number },
    dailyCapPerReferrer: { type: Number },
    weeklyCapPerReferrer: { type: Number },
    monthlyCapPerReferrer: { type: Number },
    autoCredit: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export const ReferralBonusRule = model<ReferralBonusRuleDoc>(
  'ReferralBonusRule',
  ReferralBonusRuleSchema
);
