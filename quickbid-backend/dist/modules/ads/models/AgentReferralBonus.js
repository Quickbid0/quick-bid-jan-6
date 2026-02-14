"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentReferralBonus = void 0;
const mongoose_1 = require("mongoose");
const AgentReferralBonusSchema = new mongoose_1.Schema({
    referralId: { type: String, required: true, unique: true, index: true },
    sponsorId: { type: String, required: true, index: true },
    agentId: { type: String, required: true, index: true },
    bonusAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'paid'], default: 'pending' },
    invoiceId: { type: String },
}, { timestamps: true });
exports.AgentReferralBonus = (0, mongoose_1.model)('AgentReferralBonus', AgentReferralBonusSchema);
