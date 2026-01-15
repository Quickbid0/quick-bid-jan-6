import { Handler } from "@netlify/functions";

export const config = {
  schedule: "0 * * * *" // every hour
};

const handler: Handler = async () => {
  const SUPABASE_URL = process.env.SUPABASE_URL as string;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { statusCode: 500, body: "Missing Supabase service env" };
  }

  try {
    // Fetch recent signals and users
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const signalsResp = await fetch(
      `${SUPABASE_URL}/rest/v1/fraud_signals?created_at=gte.${since}`,
      {
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    const signals = await signalsResp.json();

    // Aggregate simple rules for scoring
    const byUser: Record<string, any[]> = {};
    for (const s of signals) {
      const key = s.user_id || `anon:${s.device_hash || s.ip || Math.random()}`;
      byUser[key] = byUser[key] || [];
      byUser[key].push(s);
    }

    const updates: Array<{ user_id: string; score: number; level: string; reasons_json: any[] }> = [];

    for (const [userKey, arr] of Object.entries(byUser)) {
      // Simple heuristics
      let score = 0;
      const reasons: any[] = [];

      const kinds = arr.reduce((acc: Record<string, number>, x: any) => {
        acc[x.kind] = (acc[x.kind] || 0) + 1;
        return acc;
      }, {});

      // Velocity
      const total = arr.length;
      if (total > 50) { score += 40; reasons.push({ rule: "velocity", total }); }
      else if (total > 20) { score += 20; reasons.push({ rule: "velocity", total }); }

      // OTP resend
      const otpResends = kinds["otp_resend"] || 0;
      if (otpResends > 5) { score += 20; reasons.push({ rule: "otp_resend", count: otpResends }); }

      // Multi-account device
      const deviceHashes = new Set(arr.map((x: any) => x.device_hash).filter(Boolean));
      if (deviceHashes.size === 1 && kinds["signup"] && kinds["signup"] > 2) {
        score += 25; reasons.push({ rule: "multi_signup_single_device", device: [...deviceHashes][0] });
      }

      // Payment failures
      const paymentFails = kinds["payment_failed"] || 0;
      if (paymentFails >= 3) { score += 25; reasons.push({ rule: "payment_failed", count: paymentFails }); }

      const level = score >= 60 ? "high" : score >= 30 ? "medium" : "low";

      const user_id = userKey.startsWith("anon:") ? null : userKey;
      if (!user_id) continue; // Only persist scores for known users

      updates.push({ user_id, score, level, reasons_json: reasons });
    }

    // Upsert scores
    const upsertResp = await fetch(`${SUPABASE_URL}/rest/v1/user_risk_scores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify(updates.map(u => ({
        user_id: u.user_id,
        score: u.score,
        level: u.level,
        reasons_json: u.reasons_json,
        updated_at: new Date().toISOString(),
      }))),
    });

    if (!upsertResp.ok) {
      const text = await upsertResp.text();
      return { statusCode: 500, body: `Failed to upsert risk scores: ${text}` };
    }

    const data = await upsertResp.json();
    return { statusCode: 200, body: JSON.stringify({ ok: true, updated: data.length }) };
  } catch (e: any) {
    return { statusCode: 500, body: `Error: ${e.message}` };
  }
};

export { handler };
