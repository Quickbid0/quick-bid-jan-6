"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirstBidTracking = void 0;
const mongoose_1 = require("mongoose");
const FirstBidTrackingSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, unique: true },
    firstBidAt: { type: Date },
    firstBidId: { type: String },
    usedForBonus: { type: Boolean, default: false },
    referrerUserId: { type: String },
    source: { type: String, enum: ['user', 'agent'] },
}, { timestamps: true });
exports.FirstBidTracking = (0, mongoose_1.model)('FirstBidTracking', FirstBidTrackingSchema);
