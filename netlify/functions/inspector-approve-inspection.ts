import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { getAuthContextFromEvent, ensureRoleOrThrow } from "./_utils/auth";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

// Approves an inspection and records per-step manual status/notes.
//
// POST /.netlify/functions/inspector-approve-inspection
// Body: {
//   inspection_id: string,
//   overall_notes?: string | null,
//   step_updates?: Array<{ step_id: string; manual_status?: string | null; manual_notes?: string }>
// }
//
// Response: { ok: true }

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ ok: false, error: "Method not allowed" }),
      };
    }

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

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: "Missing Supabase service env" }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const { inspection_id, overall_notes, step_updates } = body;

    if (!inspection_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "inspection_id is required" }),
      };
    }

    // Load existing inspection for audit logging and seller notification
    const { data: existingRows, error: existingErr } = await supabase
      .from("inspections")
      .select("status, final_status, final_decision, final_grade, product_id")
      .eq("id", inspection_id)
      .limit(1);

    if (existingErr) {
      console.error("Failed to load existing inspection for audit", existingErr);
    }

    const existing = existingRows && existingRows[0] ? existingRows[0] : null;

    // 1) Update step-level manual status/notes if provided
    if (Array.isArray(step_updates) && step_updates.length > 0) {
      for (const upd of step_updates) {
        if (!upd.step_id) continue;
        const { error: stepErr } = await supabase
          .from("inspection_steps")
          .update({
            manual_status: upd.manual_status ?? null,
            manual_notes: upd.manual_notes ?? null,
          })
          .eq("id", upd.step_id)
          .eq("inspection_id", inspection_id);

        if (stepErr) {
          console.error("Failed to update inspection step", upd.step_id, stepErr);
          return {
            statusCode: 500,
            body: JSON.stringify({ ok: false, error: "Failed to update inspection steps" }),
          };
        }
      }
    }

    // 2) Update inspection status as approved
    const now = new Date().toISOString();

    const { error: inspErr } = await supabase
      .from("inspections")
      .update({
        final_status: "approved",
        final_decision: "pass",
        status: "approved",
        manual_review_notes: overall_notes ?? null,
        reviewed_at: now,
        // reviewed_by can be set from JWT-subject in a future enhancement
      })
      .eq("id", inspection_id);

    if (inspErr) {
      console.error("Failed to approve inspection", inspErr);
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: "Failed to approve inspection" }),
      };
    }

    // 3) Write audit log (best-effort)
    try {
      await supabase.from("inspection_audit_logs").insert({
        inspection_id,
        action: "approve",
        actor_id: ctx?.userId ?? null,
        old_status: existing?.status ?? null,
        new_status: "approved",
        old_final_decision: existing?.final_decision ?? null,
        new_final_decision: "pass",
        old_final_grade: existing?.final_grade ?? null,
        new_final_grade: existing?.final_grade ?? null,
        metadata: overall_notes ? { overall_notes } : null,
      });
    } catch (logErr) {
      console.error("Failed to write inspection approve audit log", logErr);
    }

    // 4) Best-effort seller notification that inspection was approved
    try {
      if (existing?.product_id) {
        const { data: product, error: productErr } = await supabase
          .from("products")
          .select("id, seller_id, title, name")
          .eq("id", existing.product_id)
          .maybeSingle();

        if (productErr) {
          console.error("Failed to load product for inspection notification", productErr);
        } else if (product && product.seller_id) {
          const productName = (product as any).title || (product as any).name || "your vehicle";
          await supabase
            .from("notifications")
            .insert({
              user_id: product.seller_id,
              type: "inspection_approved",
              title: "Inspection approved",
              message: `Your inspection for ${productName} has been approved with final grade ${(existing as any).final_grade || ""}.`,
              metadata: {
                inspection_id,
                product_id: existing.product_id,
                final_grade: (existing as any).final_grade || null,
                decision: "approved",
              },
              read: false,
              read_at: null,
            });
        }
      }
    } catch (notifErr) {
      console.error("Failed to insert seller inspection approved notification", notifErr);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err: any) {
    console.error("inspector-approve-inspection error", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message || "Internal error" }),
    };
  }
};
