import { createClient } from '@supabase/supabase-js';

/**
 * Server-only admin client that bypasses RLS policies.
 * This should ONLY be used in server route handlers.
 * NEVER export or use this in client components.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('[SUPABASE ADMIN] Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!serviceRoleKey) {
    const errorMsg = `[SUPABASE ADMIN] Missing SUPABASE_SERVICE_ROLE_KEY environment variable. 
Public availability API cannot read working hours or calendar events without this key.
Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file and restart npm run dev.
You can find this in your Supabase project settings under "API".`;
    console.error(errorMsg);
    throw new Error('[SUPABASE ADMIN] Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Check server logs for details.');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
