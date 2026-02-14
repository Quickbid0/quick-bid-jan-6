"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralBonusRule = void 0;
const mongoose_1 = require("mongoose");
const ReferralBonusRuleSchema = new mongoose_1.Schema({
    type: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    minDepositAmount: { type: Number },
    fixedBonusAmount: { type: Number },
    percentageBonus: { type: Number },
    maxBonusPerEvent: { type: Number },
    slabs: [
        {
            minAmount: { type: Number, required: true },
            maxAmount: { type: Number },
            fixedBonusAmount: { type: Number },
            percentageBonus: { type: Number },
            maxBonus: { type: Number },
        },
    ],
    firstBidFixedBonus: { type: Number },
    firstBidAgentBonus: { type: Number },
    dailyCapPerReferrer: { type: Number },
    weeklyCapPerReferrer: { type: Number },
    monthlyCapPerReferrer: { type: Number },
    autoCredit: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String },
}, { timestamps: true });
exports.ReferralBonusRule = (0, mongoose_1.model)('ReferralBonusRule', ReferralBonusRuleSchema);
