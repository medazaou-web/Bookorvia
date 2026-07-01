import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Use publishable key if present, otherwise fall back to anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

if (!supabaseUrl || !supabaseKey) {
  // Intentionally not throwing — the test page will surface missing vars.
  // Keep runtime safe for local development.
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabase;
