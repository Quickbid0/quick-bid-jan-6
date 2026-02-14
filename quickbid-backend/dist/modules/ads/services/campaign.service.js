"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCampaign = createCampaign;
exports.listCampaigns = listCampaigns;
exports.getCampaignById = getCampaignById;
exports.updateCampaign = updateCampaign;
exports.deleteCampaign = deleteCampaign;
const Campaign_1 = require("../models/Campaign");
async function createCampaign(payload) {
    const campaignId = payload.campaignId || `CMP_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const doc = new Campaign_1.Campaign({
        ...payload,
        campaignId,
    });
    await doc.save();
    return doc.toObject();
}
async function listCampaigns() {
    return Campaign_1.Campaign.find().lean();
}
async function getCampaignById(id) {
    return Campaign_1.Campaign.findOne({ campaignId: id }).lean();
}
async function updateCampaign(id, updates) {
    return Campaign_1.Campaign.findOneAndUpdate({ campaignId: id }, updates, { new: true }).lean();
}
async function deleteCampaign(id) {
    await Campaign_1.Campaign.deleteOne({ campaignId: id });
}
