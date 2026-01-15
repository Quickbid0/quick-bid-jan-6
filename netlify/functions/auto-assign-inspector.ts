import { Handler } from "@netlify/functions";

// Basic auto-assignment of an inspector for a newly created inspection.
// This is a best-effort helper that:
// - Picks a random inspector from the profiles table
// - Assigns them to the latest inspection for the given product
//
// POST /.netlify/functions/auto-assign-inspector
// Body: { productId: string }

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, error: "Method not allowed" }),
    };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL as string;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "Missing Supabase service env" }),
    };
  }

  try {
    const payload = event.body ? JSON.parse(event.body) : {};
    const { productId } = payload;

    if (!productId || typeof productId !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "productId is required" }),
      };
    }

    // 1) Load the latest inspection for this product
    const inspUrl = `${SUPABASE_URL}/rest/v1/inspections?product_id=eq.${encodeURIComponent(
      productId,
    )}&select=id,assigned_inspector_id,created_at&order=created_at.desc&limit=1`;

    const inspResp = await fetch(inspUrl, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!inspResp.ok) {
      const text = await inspResp.text();
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: `Failed to load inspection: ${text}` }),
      };
    }

    const inspections = await inspResp.json();
    const inspection = inspections[0];

    if (!inspection || inspection.assigned_inspector_id) {
      // Nothing to do
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, skipped: true }),
      };
    }

    const inspectionId = inspection.id as string;

    // 2) Load available inspectors from profiles (by role/user_type)
    const profilesUrl = `${SUPABASE_URL}/rest/v1/profiles?select=id,role,user_type`;
    const profilesResp = await fetch(profilesUrl, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!profilesResp.ok) {
      const text = await profilesResp.text();
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: `Failed to load inspectors: ${text}` }),
      };
    }

    const profiles = (await profilesResp.json()) as Array<{ id: string; role?: string | null; user_type?: string | null }>;
    const inspectors = profiles.filter((p) => {
      const r = (p.role || "").toLowerCase();
      const ut = (p.user_type || "").toLowerCase();
      return r === "inspector" || ut === "inspector";
    });

    if (!inspectors.length) {
      // No inspectors configured yet
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, skipped: true, reason: "no_inspectors" }),
      };
    }

    // Simple random assignment (could be replaced with city/category routing later)
    const chosen = inspectors[Math.floor(Math.random() * inspectors.length)];

    const updateUrl = `${SUPABASE_URL}/rest/v1/inspections?id=eq.${encodeURIComponent(inspectionId)}`;
    const updateResp = await fetch(updateUrl, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ assigned_inspector_id: chosen.id }),
    });

    if (!updateResp.ok) {
      const text = await updateResp.text();
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: `Failed to assign inspector: ${text}` }),
      };
    }

    const updated = await updateResp.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, inspection: updated?.[0] ?? null }),
    };
  } catch (e: any) {
    console.error("auto-assign-inspector error", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: e.message || "Internal error" }),
    };
  }
};

export { handler };
