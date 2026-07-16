import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies as nextCookies } from "next/headers";

// Export a function that creates a server Supabase client. Accept an optional
// cookieStore (from next/headers) to make testing and different Next versions
// compatible.
export function createServerSupabase(cookieStore?: any) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  // Default to Next's cookies() helper when no cookieStore is provided.
  const cookiesToUse = cookieStore ?? nextCookies();

  // createServerClient takes (supabaseUrl, supabaseKey, { cookies })
  const supabase = createServerClient(url, key, { cookies: cookiesToUse as any });
  return supabase;
}

// SECURITY: Duplicate removed. Use createAdminClient from '@/lib/supabase/admin' instead.
// This prevents accidental imports of the wrong implementation.
