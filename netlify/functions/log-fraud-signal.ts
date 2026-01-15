import { Handler } from "@netlify/functions";
import Razorpay from "razorpay"; // not used, but keeps types consistent if needed later
import crypto from "crypto";
import { checkRateLimit } from "./_utils/rateLimit";

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL as string;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return { statusCode: 500, body: "Missing Supabase service env" };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const {
      user_id,
      session_id,
      kind,
      value_json,
      ip,
      asn,
      country,
      device_hash,
    } = body;

    if (!kind) {
      return { statusCode: 400, body: "kind is required" };
    }

    // Rate limit: 20 events per minute per identifier
    const xff = event.headers["x-forwarded-for"] || event.headers["x-real-ip"] || "";
    const remoteIp = (ip || String(xff).split(",")[0] || "unknown").trim();
    const ident = user_id || device_hash || remoteIp || "anon";
    const rl = await checkRateLimit({ bucket: "fraud_signal", identifier: ident, limit: 20, windowSeconds: 60 });
    if (!rl.allowed) {
      return { statusCode: 429, body: "Too Many Requests" };
    }

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/fraud_signals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        user_id: user_id || null,
        session_id: session_id || null,
        kind,
        value_json: value_json || {},
        ip: ip || null,
        asn: asn || null,
        country: country || null,
        device_hash: device_hash || null,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return { statusCode: 500, body: `Failed to insert fraud signal: ${text}` };
    }

    const data = await resp.json();
    return { statusCode: 200, body: JSON.stringify({ ok: true, data }) };
  } catch (e: any) {
    return { statusCode: 500, body: `Error: ${e.message}` };
  }
};

export { handler };
