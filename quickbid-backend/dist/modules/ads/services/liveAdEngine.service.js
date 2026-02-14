"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectAdForContext = selectAdForContext;
exports.recordImpression = recordImpression;
const Campaign_1 = require("../models/Campaign");
const AdSlot_1 = require("../models/AdSlot");
const AdImpression_1 = require("../models/AdImpression");
async function selectAdForContext(ctx) {
    const now = new Date();
    const slots = await AdSlot_1.AdSlot.find({
        slotType: ctx.slotType,
        active: true,
    }).lean();
    if (!slots.length)
        return null;
    const slot = slots[0];
    const campaigns = await Campaign_1.Campaign.find({
        slotIds: slot._id,
        status: 'active',
        startDate: { $lte: now },
        endDate: { $gte: now },
    }).lean();
    if (!campaigns.length)
        return null;
    const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
    const durationSec = slot.durationSec || 10;
    return {
        slotType: ctx.slotType,
        creativeUrl: campaign.creativeUrl,
        durationSec,
        campaignId: campaign.campaignId,
        slotId: slot.slotId,
        sponsorId: campaign.sponsorId,
    };
}
async function recordImpression(params) {
    const { sponsorId, slotId, campaignId, eventId, userId, durationMs, clicked } = params;
    await AdImpression_1.AdImpression.create({
        sponsorId,
        slotId,
        campaignId,
        eventId,
        userId,
        durationMs,
        clicked,
        timestamp: new Date(),
    });
}
