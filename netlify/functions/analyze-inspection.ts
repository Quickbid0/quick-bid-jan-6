import { Handler } from "@netlify/functions";

// This function analyzes an inspection by fetching its media files from Supabase Storage,
// generating a stub AI report, and writing that report back into the `inspections` table.
// It is intentionally generic so you can later replace the stubbed AI block with a real
// vision/LLM pipeline that consumes the signed URLs.

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
    const body = event.body ? JSON.parse(event.body) : {};
    const { inspection_id } = body;

    if (!inspection_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "inspection_id is required" }),
      };
    }

    // 1) Load inspection + product metadata
    const inspectionResp = await fetch(
      `${SUPABASE_URL}/rest/v1/inspections?id=eq.${encodeURIComponent(
        inspection_id,
      )}&select=id,product_type,product_id,product:products(id,title,category,brand,model,year,metadata)`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!inspectionResp.ok) {
      const text = await inspectionResp.text();
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: `Failed to load inspection: ${text}` }),
      };
    }

    const inspections = await inspectionResp.json();
    const inspection = inspections[0];

    if (!inspection) {
      return {
        statusCode: 404,
        body: JSON.stringify({ ok: false, error: "Inspection not found" }),
      };
    }

    // 2) Load files for this inspection
    const filesResp = await fetch(
      `${SUPABASE_URL}/rest/v1/inspection_files?inspection_id=eq.${encodeURIComponent(
        inspection_id,
      )}&select=file_type,path,metadata`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!filesResp.ok) {
      const text = await filesResp.text();
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: `Failed to load inspection files: ${text}` }),
      };
    }

    const files = await filesResp.json();

    // 3) Generate signed URLs for media via Storage signed URL endpoint
    const media: Array<{ type: string; url: string; metadata: any }> = [];

    for (const f of files) {
      const storageResp = await fetch(
        `${SUPABASE_URL}/storage/v1/object/sign/inspections/${encodeURIComponent(
          f.path,
        )}?expiresIn=3600`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
        },
      );

      if (!storageResp.ok) {
        // Skip files we cannot sign; AI can still use others
        continue;
      }

      const signed = await storageResp.json();
      const signedUrl = typeof signed === "string" ? signed : signed.signedURL || signed.signedUrl;
      if (!signedUrl) continue;

      media.push({ type: f.file_type, url: signedUrl, metadata: f.metadata });
    }

    const productMeta = inspection.product || {};

    const aiPayload = {
      inspection_id,
      product_type: inspection.product_type,
      product_metadata: {
        id: productMeta.id,
        title: productMeta.title,
        category: productMeta.category,
        brand: productMeta.brand,
        model: productMeta.model,
        year: productMeta.year,
        ...(productMeta.metadata || {}),
      },
      media,
    };

    // 4) Stub AI analysis - replace this with real model integration later
    const aiReport = {
      detected_brand: aiPayload.product_metadata.brand || null,
      detected_model: aiPayload.product_metadata.model || null,
      detected_condition: "Good",
      damages: [],
      modifications: [],
      fraud_signals: [],
      documents: {},
      scores: {
        exterior: 0.8,
        interior: 0.82,
        mechanical: 0.78,
        overall: 0.8,
      },
      final_grade: "A",
      decision: "pass",
      should_recheck: false,
    };

    // 5) Write AI report back to inspections table
    const updateResp = await fetch(`${SUPABASE_URL}/rest/v1/inspections?id=eq.${encodeURIComponent(inspection_id)}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        ai_report: aiReport,
        final_grade: aiReport.final_grade,
        final_decision: aiReport.decision,
        status: "awaiting_review",
        updated_at: new Date().toISOString(),
      }),
    });

    if (!updateResp.ok) {
      const text = await updateResp.text();
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: `Failed to update inspection: ${text}` }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, report: aiReport }),
    };
  } catch (e: any) {
    console.error("analyze-inspection error", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: e.message || "Internal error" }),
    };
  }
};

export { handler };
