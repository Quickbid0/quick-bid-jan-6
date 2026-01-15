import { AdSlot, IAdSlot } from '../models/AdSlot';

export async function createAdSlot(payload: Partial<IAdSlot>) {
  const slotId = payload.slotId || `SLOT_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const doc = new AdSlot({
    ...payload,
    slotId,
  });
  await doc.save();
  return doc.toObject();
}

export async function listAdSlots() {
  return AdSlot.find().lean();
}

export async function getAdSlotById(id: string) {
  return AdSlot.findOne({ slotId: id }).lean();
}

export async function updateAdSlot(id: string, updates: Partial<IAdSlot>) {
  return AdSlot.findOneAndUpdate({ slotId: id }, updates, { new: true }).lean();
}

export async function deleteAdSlot(id: string) {
  await AdSlot.deleteOne({ slotId: id });
}
