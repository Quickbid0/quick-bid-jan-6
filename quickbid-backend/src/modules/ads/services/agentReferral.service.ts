import { AgentReferralBonus } from '../models/AgentReferralBonus';

interface CreateAgentBonusInput {
  referralId?: string;
  sponsorId: string;
  agentId: string;
  bonusAmount: number;
  invoiceId?: string;
}

export async function createAgentBonus(input: CreateAgentBonusInput) {
  const referralId =
    input.referralId || `AGB_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const doc = new AgentReferralBonus({
    ...input,
    referralId,
  });
  await doc.save();
  return doc.toObject();
}

export async function listAgentBonuses(agentId: string) {
  return AgentReferralBonus.find({ agentId }).lean();
}

export async function listAllReferralBonuses() {
  return AgentReferralBonus.find().lean();
}

export async function updateAgentBonusStatus(referralId: string, status: 'pending' | 'approved' | 'paid') {
  return AgentReferralBonus.findOneAndUpdate({ referralId }, { status }, { new: true }).lean();
}
