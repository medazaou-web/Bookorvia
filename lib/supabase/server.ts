import { createServerClient } from "@supabase/ssr";
import { cookies as nextCookies } from "next/headers";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  const cookieStore = nextCookies();

  const supabase = createServerClient(url, key, {
    cookies: cookieStore as any,
  });

  return supabase;
}
