"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdmin = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Supabase admin client is not fully configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment.');
}
exports.supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;
