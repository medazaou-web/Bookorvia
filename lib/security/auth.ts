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
    // Use request cookies for route handler auth.
    const cookieStore: any = {
      getAll: () => {
        return request.cookies.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        }));
      },
      setAll: (_cookies: any) => {},
    };

    // Primary auth path: Supabase SSR cookies
    const supabase = createServerSupabase(cookieStore);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user) {
      console.log('✅ [getAuthenticatedUser] User authenticated via cookie:', user.id);
      return user;
    }

    // Fallback auth path: Bearer token from client
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (bearerToken) {
      const adminSupabase = createAdminClient();
      const {
        data: { user: bearerUser },
        error: bearerError,
      } = await adminSupabase.auth.getUser(bearerToken);

      if (!bearerError && bearerUser) {
        console.log('✅ [getAuthenticatedUser] User authenticated via bearer:', bearerUser.id);
        return bearerUser;
      }
    }

    console.log('❌ [getAuthenticatedUser] No user found:', error?.message);
    console.log(
      '📋 [getAuthenticatedUser] Available cookies:',
      cookieStore.getAll().map((c: any) => c.name).join(', ')
    );
    return null;
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
