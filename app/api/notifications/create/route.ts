import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUserOrThrow, verifyBusinessOwnership, unauthorizedResponse } from '@/lib/security/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify user is authenticated
    let user;
    try {
      user = await getAuthenticatedUserOrThrow(request);
    } catch {
      return unauthorizedResponse('User not authenticated');
    }

    const { businessId, type, title, message, data } = await request.json();

    if (!businessId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // SECURITY: Verify user owns the business
    const ownsBusinessLocation = await verifyBusinessOwnership(businessId, user.id);
    if (!ownsBusinessLocation) {
      return unauthorizedResponse('You do not own this business');
    }

    const supabase = createAdminClient();

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        business_id: businessId,
        type,
        title,
        message,
        data,
        read: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(notification);
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create notification' },
      { status: 500 }
    );
  }
}
