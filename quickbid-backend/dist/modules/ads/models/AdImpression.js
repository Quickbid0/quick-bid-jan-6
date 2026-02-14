"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdImpression = void 0;
const mongoose_1 = require("mongoose");
const AdImpressionSchema = new mongoose_1.Schema({
    sponsorId: { type: String, required: true, index: true },
    slotId: { type: String, required: true, index: true },
    campaignId: { type: String, required: true, index: true },
    eventId: { type: String },
    userId: { type: String },
    timestamp: { type: Date, default: () => new Date(), index: true },
    durationMs: { type: Number, default: 0 },
    clicked: { type: Boolean, default: false },
}, { timestamps: true });
exports.AdImpression = (0, mongoose_1.model)('AdImpression', AdImpressionSchema);
