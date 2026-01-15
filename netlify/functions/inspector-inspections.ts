import { Handler } from "@netlify/functions";
import { getAuthContextFromEvent, ensureRoleOrThrow } from "./_utils/auth";

// Lists inspections for the authenticated inspector.
//
// GET /.netlify/functions/inspector-inspections
//
// Response: { ok: true, inspections: [...] }

const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
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
    const ctx = await getAuthContextFromEvent(event);
    try {
      ensureRoleOrThrow(ctx, ["inspector", "admin"]);
    } catch (e: any) {
      const msg = e.message === "unauthorized" ? "unauthorized" : "forbidden";
      const statusCode = e.message === "unauthorized" ? 401 : 403;
      return {
        statusCode,
        body: JSON.stringify({ ok: false, error: msg }),
      };
    }

    const inspectorId = ctx!.userId;

    const select = [
      "id",
      "product_type",
      "status",
      "final_status",
      "final_grade",
      "final_decision",
      "ai_report",
      "created_at",
      "assigned_inspector_id",
      "company_id",
      "product:products(id,title,category,brand,model,year)",
    ].join(",");

    const url = `${SUPABASE_URL}/rest/v1/inspections?assigned_inspector_id=eq.${encodeURIComponent(
      inspectorId,
    )}&select=${encodeURIComponent(select)}&order=created_at.desc`;

    const resp = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: `Failed to load inspections: ${text}` }),
      };
    }

    const inspections = await resp.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, inspections }),
    };
  } catch (e: any) {
    console.error("inspector-inspections error", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: e.message || "Internal error" }),
    };
  }
};

export { handler };
