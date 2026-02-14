"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirstDepositTracking = void 0;
const mongoose_1 = require("mongoose");
const FirstDepositTrackingSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, unique: true },
    firstDepositAt: { type: Date },
    firstDepositAmount: { type: Number },
    usedForBonus: { type: Boolean, default: false },
    referrerUserId: { type: String },
    source: { type: String, enum: ['user', 'agent'] },
}, { timestamps: true });
exports.FirstDepositTracking = (0, mongoose_1.model)('FirstDepositTracking', FirstDepositTrackingSchema);
