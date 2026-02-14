"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyFirstDepositBonus = applyFirstDepositBonus;
exports.applyFirstBidBonus = applyFirstBidBonus;
const ReferralBonusRule_1 = require("./models/ReferralBonusRule");
const ReferralBonusHistory_1 = require("./models/ReferralBonusHistory");
const FirstDepositTracking_1 = require("./models/FirstDepositTracking");
const FirstBidTracking_1 = require("./models/FirstBidTracking");
const supabaseAdmin_1 = require("../../supabaseAdmin");
async function detectReferralFraud(params) {
    const { deviceId, ipAddress } = params;
    if (!deviceId && !ipAddress) {
        return { suspicious: false };
    }
    const query = {};
    if (deviceId)
        query.deviceId = deviceId;
    if (ipAddress)
        query.ipAddress = ipAddress;
    // Only consider recent activity within a rolling 24-hour window
    const now = new Date();
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    query.createdAt = { $gte: since };
    try {
        const count = await ReferralBonusHistory_1.ReferralBonusHistory.countDocuments(query);
        const THRESHOLD = 2; // max bonuses per device/IP in 24h before auto-freeze
        if (count >= THRESHOLD) {
            const reasonParts = [];
            if (deviceId)
                reasonParts.push(`deviceId ${deviceId}`);
            if (ipAddress)
                reasonParts.push(`ip ${ipAddress}`);
            const reason = `High referral bonus volume from ${reasonParts.join(' / ')}`;
            return { suspicious: true, reason };
        }
    }
    catch (err) {
        console.error('detectReferralFraud error', err);
    }
    return { suspicious: false };
}
async function referrerDailyCapExceeded(referrerUserId) {
    if (!referrerUserId)
        return false;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    try {
        const count = await ReferralBonusHistory_1.ReferralBonusHistory.countDocuments({
            referrerUserId,
            createdAt: { $gte: startOfDay },
        });
        const DAILY_CAP = 10; // max bonuses per referrer per day
        return count >= DAILY_CAP;
    }
    catch (err) {
        console.error('referrerDailyCapExceeded error', err);
        return false;
    }
}
// Resolve referrer from Supabase profiles table using referrer_user_id / referrer_agent_id
async function getReferrerForUser(userId) {
    if (!supabaseAdmin_1.supabaseAdmin) {
        console.warn('Supabase admin client not configured; skipping referral lookup');
        return { referrerUserId: null, source: null };
    }
    const { data, error } = await supabaseAdmin_1.supabaseAdmin
        .from('profiles')
        .select('referrer_user_id, referrer_agent_id')
        .eq('id', userId)
        .maybeSingle();
    if (error) {
        console.error('getReferrerForUser error:', error);
        return { referrerUserId: null, source: null };
    }
    if (!data) {
        return { referrerUserId: null, source: null };
    }
    if (data.referrer_agent_id) {
        return { referrerUserId: data.referrer_agent_id, source: 'agent' };
    }
    if (data.referrer_user_id) {
        return { referrerUserId: data.referrer_user_id, source: 'user' };
    }
    return { referrerUserId: null, source: null };
}
async function creditWalletFromReferral(params) {
    const { userId, amount, eventType, source, historyId } = params;
    if (!amount || amount <= 0)
        return { success: false };
    try {
        const response = await fetch('/.netlify/functions/wallet-credit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                amountCents: Math.round(amount * 100),
                currency: 'INR',
                refType: source === 'agent' ? 'agent_referral_bonus' : 'referral_bonus',
                refId: historyId,
                meta: {
                    eventType,
                    source,
                },
            }),
        });
        if (!response.ok) {
            console.error('wallet-credit failed for referral bonus', userId, historyId);
            return { success: false };
        }
        let transactionId;
        try {
            const body = await response.json();
            transactionId = body?.transactionId;
        }
        catch {
            // ignore JSON parse errors
        }
        return { success: true, transactionId };
    }
    catch (err) {
        console.error('wallet-credit request error for referral bonus', userId, historyId, err);
        return { success: false };
    }
}
async function applyFirstDepositBonus(input) {
    const { userId, depositAmount, walletTransactionId, deviceId, ipAddress } = input;
    // Ensure first deposit tracking
    const tracking = await FirstDepositTracking_1.FirstDepositTracking.findOneAndUpdate({ userId }, {
        $setOnInsert: {
            userId,
            firstDepositAt: new Date(),
            firstDepositAmount: depositAmount,
        },
    }, { new: true, upsert: true });
    if (tracking.usedForBonus) {
        return { applied: false, reason: 'already_used' };
    }
    const { referrerUserId, source } = await getReferrerForUser(userId);
    if (!referrerUserId || !source) {
        // No referrer => nothing to do
        await FirstDepositTracking_1.FirstDepositTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
        return { applied: false, reason: 'no_referrer' };
    }
    const ruleType = source === 'agent' ? 'agent_first_deposit' : 'first_deposit';
    const rule = await ReferralBonusRule_1.ReferralBonusRule.findOne({ type: ruleType, isActive: true }).lean();
    if (!rule) {
        await FirstDepositTracking_1.FirstDepositTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
        return { applied: false, reason: 'no_rule' };
    }
    if (rule.minDepositAmount && depositAmount < rule.minDepositAmount) {
        await FirstDepositTracking_1.FirstDepositTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
        return { applied: false, reason: 'below_min_deposit' };
    }
    // Simple bonus calculation (no slabs for now)
    let bonusAmount = 0;
    if (rule.fixedBonusAmount) {
        bonusAmount = rule.fixedBonusAmount;
    }
    else if (rule.percentageBonus) {
        bonusAmount = depositAmount * rule.percentageBonus;
    }
    if (rule.maxBonusPerEvent && bonusAmount > rule.maxBonusPerEvent) {
        bonusAmount = rule.maxBonusPerEvent;
    }
    if (!bonusAmount || bonusAmount <= 0) {
        await FirstDepositTracking_1.FirstDepositTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
        return { applied: false, reason: 'zero_bonus' };
    }
    // Per-referrer daily cap: skip creating new bonus if referrer already hit the limit today
    const capExceeded = await referrerDailyCapExceeded(referrerUserId);
    if (capExceeded) {
        await FirstDepositTracking_1.FirstDepositTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
        return { applied: false, reason: 'referrer_daily_cap' };
    }
    const fraudCheck = await detectReferralFraud({ deviceId, ipAddress });
    const isSuspicious = fraudCheck.suspicious;
    const approvalMode = rule.autoCredit && !isSuspicious ? 'auto' : 'manual';
    const history = await ReferralBonusHistory_1.ReferralBonusHistory.create({
        referrerUserId,
        referredUserId: userId,
        source,
        eventType: 'first_deposit',
        amount: bonusAmount,
        currency: 'INR',
        depositAmount,
        walletTransactionId,
        status: isSuspicious ? 'frozen' : rule.autoCredit ? 'approved' : 'pending',
        approvalMode,
        ruleId: rule._id,
        deviceId,
        ipAddress,
        flaggedFraud: isSuspicious,
        fraudNotes: fraudCheck.reason,
    });
    // Auto-credit flow: attempt to credit wallet immediately (only if not suspicious)
    if (rule.autoCredit && !isSuspicious) {
        const creditResult = await creditWalletFromReferral({
            userId: referrerUserId,
            amount: bonusAmount,
            eventType: 'first_deposit',
            source,
            historyId: String(history._id),
        });
        if (creditResult.success) {
            await ReferralBonusHistory_1.ReferralBonusHistory.updateOne({ _id: history._id }, {
                $set: {
                    status: 'credited',
                    walletTransactionId: creditResult.transactionId,
                },
            });
        }
    }
    await FirstDepositTracking_1.FirstDepositTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
    return { applied: true, historyId: history._id, amount: bonusAmount };
}
async function applyFirstBidBonus(input) {
    const { userId, bidId, deviceId, ipAddress } = input;
    const tracking = await FirstBidTracking_1.FirstBidTracking.findOneAndUpdate({ userId }, {
        $setOnInsert: {
            userId,
            firstBidAt: new Date(),
            firstBidId: bidId,
        },
    }, { new: true, upsert: true });
    if (tracking.usedForBonus) {
        return { applied: false, reason: 'already_used' };
    }
    const { referrerUserId, source } = await getReferrerForUser(userId);
    if (!referrerUserId || !source) {
        await FirstBidTracking_1.FirstBidTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
        return { applied: false, reason: 'no_referrer' };
    }
    const ruleType = source === 'agent' ? 'agent_first_bid' : 'first_bid';
    const rule = await ReferralBonusRule_1.ReferralBonusRule.findOne({ type: ruleType, isActive: true }).lean();
    if (!rule) {
        await FirstBidTracking_1.FirstBidTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
        return { applied: false, reason: 'no_rule' };
    }
    const bonusAmount = source === 'agent' && rule.firstBidAgentBonus
        ? rule.firstBidAgentBonus
        : rule.firstBidFixedBonus || 0;
    if (!bonusAmount || bonusAmount <= 0) {
        await FirstBidTracking_1.FirstBidTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
        return { applied: false, reason: 'zero_bonus' };
    }
    // Per-referrer daily cap: skip creating new bonus if referrer already hit the limit today
    const capExceeded = await referrerDailyCapExceeded(referrerUserId);
    if (capExceeded) {
        await FirstBidTracking_1.FirstBidTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
        return { applied: false, reason: 'referrer_daily_cap' };
    }
    const fraudCheck = await detectReferralFraud({ deviceId, ipAddress });
    const isSuspicious = fraudCheck.suspicious;
    const approvalMode = rule.autoCredit && !isSuspicious ? 'auto' : 'manual';
    const history = await ReferralBonusHistory_1.ReferralBonusHistory.create({
        referrerUserId,
        referredUserId: userId,
        source,
        eventType: 'first_bid',
        amount: bonusAmount,
        currency: 'INR',
        bidId,
        status: isSuspicious ? 'frozen' : rule.autoCredit ? 'approved' : 'pending',
        approvalMode,
        ruleId: rule._id,
        deviceId,
        ipAddress,
        flaggedFraud: isSuspicious,
        fraudNotes: fraudCheck.reason,
    });
    if (rule.autoCredit && !isSuspicious) {
        const creditResult = await creditWalletFromReferral({
            userId: referrerUserId,
            amount: bonusAmount,
            eventType: 'first_bid',
            source,
            historyId: String(history._id),
        });
        if (creditResult.success) {
            await ReferralBonusHistory_1.ReferralBonusHistory.updateOne({ _id: history._id }, {
                $set: {
                    status: 'credited',
                    walletTransactionId: creditResult.transactionId,
                },
            });
        }
    }
    await FirstBidTracking_1.FirstBidTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
    return { applied: true, historyId: history._id, amount: bonusAmount };
}
