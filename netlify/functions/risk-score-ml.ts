import { Handler } from "@netlify/functions";

// Simple ML inference placeholder: fetch feature view and compute heuristic score
// Later: load latest model artifact from Supabase Storage (models bucket) using ai_models.artifact_url

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL as string;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { statusCode: 500, body: "Missing Supabase service env" };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const user_id = body.user_id as string | undefined;
    if (!user_id) {
      return { statusCode: 400, body: "user_id is required" };
    }

    // Fetch features from view
    const featResp = await fetch(
      `${SUPABASE_URL}/rest/v1/vw_user_features?user_id=eq.${user_id}&select=*`,
      { headers: { "apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } }
    );
    const feats = await featResp.json();
    const f = feats?.[0] || {};

    // Heuristic scoring as fallback (0..100)
    let score = 0;
    const reasons: any[] = [];

    const otp = Number(f.otp_resend_7d || 0);
    if (otp >= 10) { score += 30; reasons.push({ feature: "otp_resend_7d", value: otp }); }
    else if (otp >= 5) { score += 15; reasons.push({ feature: "otp_resend_7d", value: otp }); }

    const pf = Number(f.payment_failed_7d || 0);
    if (pf >= 5) { score += 40; reasons.push({ feature: "payment_failed_7d", value: pf }); }
    else if (pf >= 2) { score += 20; reasons.push({ feature: "payment_failed_7d", value: pf }); }

    const devs = Number(f.distinct_devices_30d || 0);
    if (devs >= 5) { score += 20; reasons.push({ feature: "distinct_devices_30d", value: devs }); }
    else if (devs >= 3) { score += 10; reasons.push({ feature: "distinct_devices_30d", value: devs }); }

    const lf = Number(f.login_failed_7d || 0);
    if (lf >= 10) { score += 20; reasons.push({ feature: "login_failed_7d", value: lf }); }
    else if (lf >= 5) { score += 10; reasons.push({ feature: "login_failed_7d", value: lf }); }

    if (score > 100) score = 100;
    const level = score >= 70 ? "high" : score >= 40 ? "medium" : "low";

    // Log inference for monitoring
    await fetch(`${SUPABASE_URL}/rest/v1/inference_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        user_id,
        model_id: null,
        score,
        reasons_json: reasons,
        features_json: f,
      })
    });

    return { statusCode: 200, body: JSON.stringify({ user_id, score, level, reasons, features: f }) };
  } catch (e: any) {
    return { statusCode: 500, body: `Error: ${e.message}` };
  }
};

export { handler };
