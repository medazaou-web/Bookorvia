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
  try {
    // For API routes: create a server client that reads cookies from the request
    const supabase = createServerSupabase();
    
    // The server client will automatically extract auth from cookies
    // (they're available in the request context)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.log('❌ [getAuthenticatedUser] No user found:', error?.message);
      return null;
    }

    console.log('✅ [getAuthenticatedUser] User authenticated:', user.id);
    return user;
  } catch (e: any) {
    console.error('❌ [getAuthenticatedUser] Error:', e.message);
    return null;
  }
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
