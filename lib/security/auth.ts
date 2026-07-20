import 'server-only';

import { createServerSupabase } from '@/lib/supabase/serverClient';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

/**
 * SECURITY UTILITY: Server-only auth and authorization checks
 * All functions in this file must ONLY be called from server components,
 * server actions, and route handlers.
 */

export async function getAuthenticatedUser(request: NextRequest) {
  // In API route handlers, we get cookies from the incoming request headers
  const { cookies: getCookies } = await import('next/headers');
  const cookieStore = getCookies();
  
  const supabase = createServerSupabase(cookieStore);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getAuthenticatedUserOrThrow(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new Error('Unauthorized: User not authenticated');
  }

  return user;
}

/**
 * Verify that the authenticated user owns the given business
 */
export async function verifyBusinessOwnership(
  businessId: string,
  userId: string
): Promise<boolean> {
  const supabase = createServerSupabase();

  const { data: business, error } = await supabase
    .from('businesses')
    .select('user_id')
    .eq('id', businessId)
    .single();

  if (error || !business) {
    return false;
  }

  return business.user_id === userId;
}

/**
 * Verify user is admin (has admin role in profiles table)
 */
export async function verifyIsAdmin(userId: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return false;
  }

  return profile.role === 'admin';
}

/**
 * SECURITY: Unauthorized response helper
 */
export function unauthorizedResponse(reason: string = 'Unauthorized') {
  return NextResponse.json({ error: reason }, { status: 401 });
}

/**
 * SECURITY: Forbidden response helper
 */
export function forbiddenResponse(reason: string = 'Forbidden') {
  return NextResponse.json({ error: reason }, { status: 403 });
}

/**
 * SECURITY: Bad request response helper
 */
export function badRequestResponse(reason: string = 'Bad request') {
  return NextResponse.json({ error: reason }, { status: 400 });
}
