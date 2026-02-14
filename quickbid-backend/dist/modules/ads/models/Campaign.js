"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Campaign = void 0;
const mongoose_1 = require("mongoose");
const CampaignAnalyticsSchema = new mongoose_1.Schema({
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    watchTimeMs: { type: Number, default: 0 },
    cpmEffective: { type: Number },
}, { _id: false });
const CampaignSchema = new mongoose_1.Schema({
    campaignId: { type: String, required: true, unique: true, index: true },
    sponsorId: { type: String, required: true, index: true },
    slotIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'AdSlot' }],
    creativeUrl: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    impressionCap: { type: Number },
    eventIds: { type: [String], default: [] },
    status: {
        type: String,
        enum: ['draft', 'pending', 'active', 'paused', 'completed'],
        default: 'draft',
    },
    pricingModel: { type: String, enum: ['flat', 'cpm', 'cpc'], default: 'flat' },
    analytics: { type: CampaignAnalyticsSchema, default: () => ({}) },
}, { timestamps: true });
exports.Campaign = (0, mongoose_1.model)('Campaign', CampaignSchema);
