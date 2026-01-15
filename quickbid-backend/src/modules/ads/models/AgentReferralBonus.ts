import { Schema, model, Document } from 'mongoose';

export type AgentBonusStatus = 'pending' | 'approved' | 'paid';

export interface IAgentReferralBonus extends Document {
  referralId: string;
  sponsorId: string;
  agentId: string;
  bonusAmount: number;
  status: AgentBonusStatus;
  invoiceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AgentReferralBonusSchema = new Schema<IAgentReferralBonus>(
  {
    referralId: { type: String, required: true, unique: true, index: true },
    sponsorId: { type: String, required: true, index: true },
    agentId: { type: String, required: true, index: true },
    bonusAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'paid'], default: 'pending' },
    invoiceId: { type: String },
  },
  { timestamps: true }
);

export const AgentReferralBonus = model<IAgentReferralBonus>('AgentReferralBonus', AgentReferralBonusSchema);
