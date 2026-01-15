import { ReferralBonusRule } from './models/ReferralBonusRule';
import { ReferralBonusHistory } from './models/ReferralBonusHistory';
import { FirstDepositTracking } from './models/FirstDepositTracking';
import { FirstBidTracking } from './models/FirstBidTracking';
import { supabaseAdmin } from '../../supabaseAdmin';

interface FirstDepositInput {
  userId: string;
  depositAmount: number;
  walletTransactionId: string;
  deviceId?: string;
  ipAddress?: string;
}

interface FirstBidInput {
  userId: string;
  bidId: string;
  deviceId?: string;
  ipAddress?: string;
}

type RefSource = 'user' | 'agent';

async function detectReferralFraud(params: {
  deviceId?: string;
  ipAddress?: string;
}): Promise<{ suspicious: boolean; reason?: string }> {
  const { deviceId, ipAddress } = params;

  if (!deviceId && !ipAddress) {
    return { suspicious: false };
  }

  const query: any = {};
  if (deviceId) query.deviceId = deviceId;
  if (ipAddress) query.ipAddress = ipAddress;

  // Only consider recent activity within a rolling 24-hour window
  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  query.createdAt = { $gte: since };

  try {
    const count = await ReferralBonusHistory.countDocuments(query);
    const THRESHOLD = 2; // max bonuses per device/IP in 24h before auto-freeze
    if (count >= THRESHOLD) {
      const reasonParts: string[] = [];
      if (deviceId) reasonParts.push(`deviceId ${deviceId}`);
      if (ipAddress) reasonParts.push(`ip ${ipAddress}`);
      const reason = `High referral bonus volume from ${reasonParts.join(' / ')}`;
      return { suspicious: true, reason };
    }
  } catch (err) {
    console.error('detectReferralFraud error', err);
  }

  return { suspicious: false };
}

async function referrerDailyCapExceeded(referrerUserId: string): Promise<boolean> {
  if (!referrerUserId) return false;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  try {
    const count = await ReferralBonusHistory.countDocuments({
      referrerUserId,
      createdAt: { $gte: startOfDay },
    });
    const DAILY_CAP = 10; // max bonuses per referrer per day
    return count >= DAILY_CAP;
  } catch (err) {
    console.error('referrerDailyCapExceeded error', err);
    return false;
  }
}

// Resolve referrer from Supabase profiles table using referrer_user_id / referrer_agent_id
async function getReferrerForUser(
  userId: string
): Promise<{ referrerUserId: string | null; source: RefSource | null }> {
  if (!supabaseAdmin) {
    console.warn('Supabase admin client not configured; skipping referral lookup');
    return { referrerUserId: null, source: null };
  }

  const { data, error } = await supabaseAdmin
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

async function creditWalletFromReferral(
  params: {
    userId: string;
    amount: number;
    eventType: 'first_deposit' | 'first_bid';
    source: RefSource;
    historyId: string;
  }
): Promise<{ success: boolean; transactionId?: string }> {
  const { userId, amount, eventType, source, historyId } = params;

  if (!amount || amount <= 0) return { success: false };

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

    let transactionId: string | undefined;
    try {
      const body = await response.json();
      transactionId = body?.transactionId;
    } catch {
      // ignore JSON parse errors
    }

    return { success: true, transactionId };
  } catch (err) {
    console.error('wallet-credit request error for referral bonus', userId, historyId, err);
    return { success: false };
  }
}

export async function applyFirstDepositBonus(input: FirstDepositInput) {
  const { userId, depositAmount, walletTransactionId, deviceId, ipAddress } = input;

  // Ensure first deposit tracking
  const tracking = await FirstDepositTracking.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        firstDepositAt: new Date(),
        firstDepositAmount: depositAmount,
      },
    },
    { new: true, upsert: true }
  );

  if (tracking.usedForBonus) {
    return { applied: false, reason: 'already_used' };
  }

  const { referrerUserId, source } = await getReferrerForUser(userId);
  if (!referrerUserId || !source) {
    // No referrer => nothing to do
    await FirstDepositTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
    return { applied: false, reason: 'no_referrer' };
  }

  const ruleType = source === 'agent' ? 'agent_first_deposit' : 'first_deposit';
  const rule = await ReferralBonusRule.findOne({ type: ruleType, isActive: true }).lean();
  if (!rule) {
    await FirstDepositTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
    return { applied: false, reason: 'no_rule' };
  }

  if (rule.minDepositAmount && depositAmount < rule.minDepositAmount) {
    await FirstDepositTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
    return { applied: false, reason: 'below_min_deposit' };
  }

  // Simple bonus calculation (no slabs for now)
  let bonusAmount = 0;
  if (rule.fixedBonusAmount) {
    bonusAmount = rule.fixedBonusAmount;
  } else if (rule.percentageBonus) {
    bonusAmount = depositAmount * rule.percentageBonus;
  }
  if (rule.maxBonusPerEvent && bonusAmount > rule.maxBonusPerEvent) {
    bonusAmount = rule.maxBonusPerEvent;
  }

  if (!bonusAmount || bonusAmount <= 0) {
    await FirstDepositTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
    return { applied: false, reason: 'zero_bonus' };
  }

  // Per-referrer daily cap: skip creating new bonus if referrer already hit the limit today
  const capExceeded = await referrerDailyCapExceeded(referrerUserId);
  if (capExceeded) {
    await FirstDepositTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
    return { applied: false, reason: 'referrer_daily_cap' };
  }

  const fraudCheck = await detectReferralFraud({ deviceId, ipAddress });
  const isSuspicious = fraudCheck.suspicious;
  const approvalMode = rule.autoCredit && !isSuspicious ? 'auto' : 'manual';

  const history = await ReferralBonusHistory.create({
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
      await ReferralBonusHistory.updateOne(
        { _id: history._id },
        {
          $set: {
            status: 'credited',
            walletTransactionId: creditResult.transactionId,
          },
        }
      );
    }
  }

  await FirstDepositTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });

  return { applied: true, historyId: history._id, amount: bonusAmount };
}

export async function applyFirstBidBonus(input: FirstBidInput) {
  const { userId, bidId, deviceId, ipAddress } = input;

  const tracking = await FirstBidTracking.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        firstBidAt: new Date(),
        firstBidId: bidId,
      },
    },
    { new: true, upsert: true }
  );

  if (tracking.usedForBonus) {
    return { applied: false, reason: 'already_used' };
  }

  const { referrerUserId, source } = await getReferrerForUser(userId);
  if (!referrerUserId || !source) {
    await FirstBidTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
    return { applied: false, reason: 'no_referrer' };
  }

  const ruleType = source === 'agent' ? 'agent_first_bid' : 'first_bid';
  const rule = await ReferralBonusRule.findOne({ type: ruleType, isActive: true }).lean();
  if (!rule) {
    await FirstBidTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
    return { applied: false, reason: 'no_rule' };
  }

  const bonusAmount =
    source === 'agent' && rule.firstBidAgentBonus
      ? rule.firstBidAgentBonus
      : rule.firstBidFixedBonus || 0;

  if (!bonusAmount || bonusAmount <= 0) {
    await FirstBidTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
    return { applied: false, reason: 'zero_bonus' };
  }

  // Per-referrer daily cap: skip creating new bonus if referrer already hit the limit today
  const capExceeded = await referrerDailyCapExceeded(referrerUserId);
  if (capExceeded) {
    await FirstBidTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });
    return { applied: false, reason: 'referrer_daily_cap' };
  }

  const fraudCheck = await detectReferralFraud({ deviceId, ipAddress });
  const isSuspicious = fraudCheck.suspicious;
  const approvalMode = rule.autoCredit && !isSuspicious ? 'auto' : 'manual';

  const history = await ReferralBonusHistory.create({
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
      await ReferralBonusHistory.updateOne(
        { _id: history._id },
        {
          $set: {
            status: 'credited',
            walletTransactionId: creditResult.transactionId,
          },
        }
      );
    }
  }

  await FirstBidTracking.updateOne({ _id: tracking._id }, { $set: { usedForBonus: true } });

  return { applied: true, historyId: history._id, amount: bonusAmount };
}
