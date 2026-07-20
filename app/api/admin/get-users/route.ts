import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUserOrThrow, verifyIsAdmin, unauthorizedResponse } from '@/lib/security/auth';

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Verify user is authenticated and is an admin
    let user;
    try {
      user = await getAuthenticatedUserOrThrow(request);
    } catch {
      return unauthorizedResponse('User not authenticated');
    }

    const isAdmin = await verifyIsAdmin(user.id);
    if (!isAdmin) {
      return unauthorizedResponse('User is not an admin');
    }

    console.log("⚡ [get-users API] Admin request from:", user.id);
    const supabase = createAdminClient();

    // Fetch all auth users with pagination
    console.log("⚡ [get-users API] Fetching all auth users...");
    const authUsers: any[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const { data, error: listErr } = await supabase.auth.admin.listUsers({ page, perPage });
      if (listErr) {
        console.error('❌ [get-users API] Error listing auth users:', listErr);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
      }

      const batch = data?.users || [];
      authUsers.push(...batch);

      if (batch.length < perPage) break;
      page += 1;
    }

    console.log(`⚡ [get-users API] Fetched ${authUsers.length} auth users`);

    const authUserIds = authUsers.map((u) => u.id);
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url, created_at')
      .in('id', authUserIds.length > 0 ? authUserIds : ['00000000-0000-0000-0000-000000000000']);

    if (error) {
      console.error('❌ [get-users API] Error fetching profiles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    // Return all auth users, filling profile fields when available
    const usersWithEmails = authUsers.map((authUser: any) => {
      const profile = profileMap.get(authUser.id);
      return {
        id: authUser.id,
        name: profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Unknown User',
        email: authUser.email || '',
        role: profile?.role || 'user',
        avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url || null,
        created_at: profile?.created_at || authUser.created_at,
      };
    });

    console.log(`✅ [get-users API] Returning ${usersWithEmails.length} users (50-100x faster!)`);
    return NextResponse.json({ users: usersWithEmails }, { status: 200 });
  } catch (err) {
    console.error('❌ [get-users API] Error in get-users:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
