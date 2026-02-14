"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgentBonus = createAgentBonus;
exports.listAgentBonuses = listAgentBonuses;
exports.listAllReferralBonuses = listAllReferralBonuses;
exports.updateAgentBonusStatus = updateAgentBonusStatus;
const AgentReferralBonus_1 = require("../models/AgentReferralBonus");
async function createAgentBonus(input) {
    const referralId = input.referralId || `AGB_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const doc = new AgentReferralBonus_1.AgentReferralBonus({
        ...input,
        referralId,
    });
    await doc.save();
    return doc.toObject();
}
async function listAgentBonuses(agentId) {
    return AgentReferralBonus_1.AgentReferralBonus.find({ agentId }).lean();
}
async function listAllReferralBonuses() {
    return AgentReferralBonus_1.AgentReferralBonus.find().lean();
}
async function updateAgentBonusStatus(referralId, status) {
    return AgentReferralBonus_1.AgentReferralBonus.findOneAndUpdate({ referralId }, { status }, { new: true }).lean();
}
