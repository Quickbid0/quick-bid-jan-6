import { supabaseAdmin } from '../../../supabaseAdmin';

export type RiskLevel = 'low' | 'medium' | 'high';
export type ControlStatus = 'normal' | 'limited' | 'blocked' | 'flagged';

export interface SellerRiskSummary {
  sellerId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: ControlStatus;
  penaltyPoints: number;
  cooldownActive: boolean;
  cooldownUntil: string | null;
  cooldownReason: string | null;
}

const SELLER_RISK_CACHE_TTL_MS = 30_000;
const sellerRiskCache = new Map<string, { summary: SellerRiskSummary; expiresAt: number }>();

export interface ApplySellerPenaltyInput {
  sellerId: string;
  type: string; // e.g. 'fake_product', 'kyc_issue'
  severity: 'low' | 'medium' | 'high';
  points?: number;
  reason?: string | null;
  evidenceJson?: Record<string, any>;
  appliedBy?: string | null;
  cooldownDays?: number; // optional explicit cooldown window
}

export async function getSellerRiskSummary(sellerId: string): Promise<SellerRiskSummary | null> {
  if (!supabaseAdmin) {
    throw Object.assign(new Error('Supabase admin not configured'), { statusCode: 500 });
  }

  const cached = sellerRiskCache.get(sellerId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.summary;
  }

  const { data: risk, error: riskErr } = await supabaseAdmin
    .from('user_risk_scores')
    .select('score, level')
    .eq('user_id', sellerId)
    .maybeSingle();

  if (riskErr) {
    console.error('getSellerRiskSummary: risk select error', riskErr);
  }

  const { data: control, error: controlErr } = await supabaseAdmin
    .from('user_controls')
    .select('status, cooldown_until, cooldown_reason, penalty_points')
    .eq('user_id', sellerId)
    .maybeSingle();

  if (controlErr) {
    console.error('getSellerRiskSummary: controls select error', controlErr);
  }

  if (!risk && !control) {
    return null;
  }

  const now = new Date();
  const cooldownUntil = control?.cooldown_until as string | null;
  const cooldownActive = !!cooldownUntil && new Date(cooldownUntil) > now;

  const result: SellerRiskSummary = {
    sellerId,
    riskScore: risk?.score != null ? Number(risk.score) : 0,
    riskLevel: (risk?.level as RiskLevel) || 'low',
    status: (control?.status as ControlStatus) || 'normal',
    penaltyPoints: control?.penalty_points != null ? Number(control.penalty_points) : 0,
    cooldownActive,
    cooldownUntil: cooldownUntil || null,
    cooldownReason: (control?.cooldown_reason as string) || null,
  };

  sellerRiskCache.set(sellerId, {
    summary: result,
    expiresAt: Date.now() + SELLER_RISK_CACHE_TTL_MS,
  });

  return result;
}

export async function applySellerPenalty(input: ApplySellerPenaltyInput): Promise<SellerRiskSummary> {
  if (!supabaseAdmin) {
    throw Object.assign(new Error('Supabase admin not configured'), { statusCode: 500 });
  }

  const {
    sellerId,
    type,
    severity,
    points = 1,
    reason = null,
    evidenceJson = {},
    appliedBy = null,
    cooldownDays,
  } = input;

  const now = new Date();

  const { error: insertPenaltyError } = await supabaseAdmin
    .from('seller_penalties')
    .insert({
      seller_id: sellerId,
      type,
      severity,
      points,
      reason,
      evidence_json: evidenceJson,
      applied_by: appliedBy,
    });

  if (insertPenaltyError) {
    console.error('applySellerPenalty: insert seller_penalties error', insertPenaltyError);
    throw Object.assign(new Error('Failed to record seller penalty'), { statusCode: 500 });
  }

  const { data: existingControl, error: controlErr } = await supabaseAdmin
    .from('user_controls')
    .select('status, penalty_points, cooldown_until')
    .eq('user_id', sellerId)
    .maybeSingle();

  if (controlErr) {
    console.error('applySellerPenalty: select user_controls error', controlErr);
  }

  const currentPoints = existingControl?.penalty_points != null
    ? Number(existingControl.penalty_points)
    : 0;
  const nextPoints = currentPoints + points;

  let nextStatus: ControlStatus = (existingControl?.status as ControlStatus) || 'normal';
  if (severity === 'high' || nextPoints >= 10) {
    nextStatus = 'blocked';
  } else if (severity === 'medium' || nextPoints >= 5) {
    nextStatus = 'limited';
  }

  let nextCooldownUntil: string | null = existingControl?.cooldown_until as string | null;
  const baseDays = severity === 'high' ? 14 : severity === 'medium' ? 7 : 3;
  const totalDays = typeof cooldownDays === 'number' && cooldownDays > 0 ? cooldownDays : baseDays;

  const proposedUntil = new Date(now.getTime() + totalDays * 24 * 60 * 60 * 1000).toISOString();
  if (!nextCooldownUntil || new Date(proposedUntil) > new Date(nextCooldownUntil)) {
    nextCooldownUntil = proposedUntil;
  }

  const { error: upsertErr } = await supabaseAdmin
    .from('user_controls')
    .upsert(
      {
        user_id: sellerId,
        status: nextStatus,
        notes: reason,
        updated_by: appliedBy,
        updated_at: now.toISOString(),
        penalty_points: nextPoints,
        cooldown_until: nextCooldownUntil,
        cooldown_reason: reason,
        cooldown_source: type,
      },
      { onConflict: 'user_id' },
    );

  if (upsertErr) {
    console.error('applySellerPenalty: upsert user_controls error', upsertErr);
    throw Object.assign(new Error('Failed to update seller controls'), { statusCode: 500 });
  }

  const summary = await getSellerRiskSummary(sellerId);
  if (!summary) {
    throw Object.assign(new Error('Failed to compute updated seller risk summary'), { statusCode: 500 });
  }
  return summary;
}

export async function checkSellerRestriction(sellerId: string): Promise<{
  allowed: boolean;
  status: ControlStatus;
  cooldownActive: boolean;
  cooldownUntil: string | null;
}> {
  const summary = await getSellerRiskSummary(sellerId);
  if (!summary) {
    return { allowed: true, status: 'normal', cooldownActive: false, cooldownUntil: null };
  }

  const blocked = summary.status === 'blocked';
  const limitedAndCooldown = summary.status === 'limited' && summary.cooldownActive;

  return {
    allowed: !(blocked || limitedAndCooldown),
    status: summary.status,
    cooldownActive: summary.cooldownActive,
    cooldownUntil: summary.cooldownUntil,
  };
}
