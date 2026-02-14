"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSponsor = createSponsor;
exports.listSponsors = listSponsors;
exports.getSponsorById = getSponsorById;
exports.updateSponsor = updateSponsor;
exports.deleteSponsor = deleteSponsor;
const Sponsor_1 = require("../models/Sponsor");
async function createSponsor(payload) {
    const sponsorId = payload.sponsorId || `SPN_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const doc = new Sponsor_1.Sponsor({
        ...payload,
        sponsorId,
    });
    await doc.save();
    return doc.toObject();
}
async function listSponsors() {
    return Sponsor_1.Sponsor.find().lean();
}
async function getSponsorById(id) {
    return Sponsor_1.Sponsor.findOne({ sponsorId: id }).lean();
}
async function updateSponsor(id, updates) {
    return Sponsor_1.Sponsor.findOneAndUpdate({ sponsorId: id }, updates, { new: true }).lean();
}
async function deleteSponsor(id) {
    await Sponsor_1.Sponsor.deleteOne({ sponsorId: id });
}
