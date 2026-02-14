"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralBonusHistory = void 0;
const mongoose_1 = require("mongoose");
const ReferralBonusHistorySchema = new mongoose_1.Schema({
    referrerUserId: { type: String, required: true, index: true },
    referredUserId: { type: String, required: true, index: true },
    source: { type: String, enum: ['user', 'agent'], required: true },
    eventType: { type: String, enum: ['first_deposit', 'first_bid'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    depositAmount: { type: Number },
    bidId: { type: String },
    walletTransactionId: { type: String },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'frozen', 'credited'],
        default: 'pending',
    },
    approvalMode: { type: String, enum: ['auto', 'manual'], required: true },
    ruleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ReferralBonusRule', required: true },
    reason: { type: String },
    flaggedFraud: { type: Boolean, default: false },
    fraudNotes: { type: String },
    deviceId: { type: String },
    ipAddress: { type: String },
    approvedBy: { type: String },
    frozenBy: { type: String },
}, { timestamps: true });
exports.ReferralBonusHistory = (0, mongoose_1.model)('ReferralBonusHistory', ReferralBonusHistorySchema);
