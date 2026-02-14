"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdSlot = createAdSlot;
exports.listAdSlots = listAdSlots;
exports.getAdSlotById = getAdSlotById;
exports.updateAdSlot = updateAdSlot;
exports.deleteAdSlot = deleteAdSlot;
const AdSlot_1 = require("../models/AdSlot");
async function createAdSlot(payload) {
    const slotId = payload.slotId || `SLOT_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const doc = new AdSlot_1.AdSlot({
        ...payload,
        slotId,
    });
    await doc.save();
    return doc.toObject();
}
async function listAdSlots() {
    return AdSlot_1.AdSlot.find().lean();
}
async function getAdSlotById(id) {
    return AdSlot_1.AdSlot.findOne({ slotId: id }).lean();
}
async function updateAdSlot(id, updates) {
    return AdSlot_1.AdSlot.findOneAndUpdate({ slotId: id }, updates, { new: true }).lean();
}
async function deleteAdSlot(id) {
    await AdSlot_1.AdSlot.deleteOne({ slotId: id });
}
