import { Campaign, ICampaign } from '../models/Campaign';

export async function createCampaign(payload: Partial<ICampaign>) {
  const campaignId = payload.campaignId || `CMP_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const doc = new Campaign({
    ...payload,
    campaignId,
  });
  await doc.save();
  return doc.toObject();
}

export async function listCampaigns() {
  return Campaign.find().lean();
}

export async function getCampaignById(id: string) {
  return Campaign.findOne({ campaignId: id }).lean();
}

export async function updateCampaign(id: string, updates: Partial<ICampaign>) {
  return Campaign.findOneAndUpdate({ campaignId: id }, updates, { new: true }).lean();
}

export async function deleteCampaign(id: string) {
  await Campaign.deleteOne({ campaignId: id });
}
