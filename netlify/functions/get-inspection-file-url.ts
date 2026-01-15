import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

// Returns a short-lived signed URL for an inspection file in the `inspections` bucket.
//
// POST /.netlify/functions/get-inspection-file-url
// Body: { path: string, expiresInSeconds?: number }
//
// Response: { ok: true, url: string }

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ ok: false, error: "Method not allowed" }),
      };
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: "Missing Supabase service env" }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const { path, expiresInSeconds } = body;

    if (!path || typeof path !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "path is required" }),
      };
    }

    const expiresIn = typeof expiresInSeconds === "number" && expiresInSeconds > 0
      ? Math.min(expiresInSeconds, 24 * 60 * 60) // cap at 24h
      : 60 * 60; // default 1h

    const { data, error } = await supabase
      .storage
      .from('inspections')
      .createSignedUrl(path, expiresIn);

    if (error || !data?.signedUrl) {
      console.error('get-inspection-file-url: failed to sign', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: "Failed to create signed URL" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, url: data.signedUrl }),
    };
  } catch (err: any) {
    console.error('get-inspection-file-url error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message || "Internal error" }),
    };
  }
};
