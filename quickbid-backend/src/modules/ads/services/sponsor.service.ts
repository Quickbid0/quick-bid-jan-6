import { Sponsor, ISponsor } from '../models/Sponsor';

export async function createSponsor(payload: Partial<ISponsor>) {
  const sponsorId = payload.sponsorId || `SPN_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const doc = new Sponsor({
    ...payload,
    sponsorId,
  });
  await doc.save();
  return doc.toObject();
}

export async function listSponsors() {
  return Sponsor.find().lean();
}

export async function getSponsorById(id: string) {
  return Sponsor.findOne({ sponsorId: id }).lean();
}

export async function updateSponsor(id: string, updates: Partial<ISponsor>) {
  return Sponsor.findOneAndUpdate({ sponsorId: id }, updates, { new: true }).lean();
}

export async function deleteSponsor(id: string) {
  await Sponsor.deleteOne({ sponsorId: id });
}
