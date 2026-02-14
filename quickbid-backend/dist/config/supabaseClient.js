"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase client not fully configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.');
}
exports.supabase = SUPABASE_URL && SUPABASE_ANON_KEY
    ? (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
