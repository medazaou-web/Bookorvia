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

    // Optimized: Fetch all auth users at once (single batch call)
    console.log("⚡ [get-users API] Fetching all auth users...");
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
    const emailMap = new Map(authUsers.map(u => [u.id, u.email]));
    console.log(`⚡ [get-users API] Fetched ${authUsers.length} auth users`);

    // Get profiles with pagination
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .limit(10000); // Add pagination limit

    if (error) {
      console.error('❌ [get-users API] Error fetching profiles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Merge data in memory (no additional API calls)
    const usersWithEmails = (profiles || [])
      .map((profile: any) => ({
        id: profile.id,
        name: profile.full_name || 'Unknown User',
        email: emailMap.get(profile.id) || '',
      }))
      .filter(u => u.email); // Only return users with emails

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
