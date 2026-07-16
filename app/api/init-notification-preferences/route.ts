import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '../../../lib/supabase/serverClient';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase(await cookies());
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      // Create profile with default notification preferences
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          email_notifications_enabled: true,
          email_booking_notifications: true,
          email_status_notifications: true,
          email_admin_notifications: true,
          email_review_notifications: true,
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        return NextResponse.json(
          { error: 'Failed to initialize notification preferences' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Notification preferences initialized',
        created: true,
      });
    }

    // If profile exists but notification preferences are missing, update them
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        email_notifications_enabled: (profile as any).email_notifications_enabled !== undefined ? (profile as any).email_notifications_enabled : true,
        email_booking_notifications: (profile as any).email_booking_notifications !== undefined ? (profile as any).email_booking_notifications : true,
        email_status_notifications: (profile as any).email_status_notifications !== undefined ? (profile as any).email_status_notifications : true,
        email_admin_notifications: (profile as any).email_admin_notifications !== undefined ? (profile as any).email_admin_notifications : true,
        email_review_notifications: (profile as any).email_review_notifications !== undefined ? (profile as any).email_review_notifications : true,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      // Don't fail - preferences might already exist
    }

    return NextResponse.json({
      success: true,
      message: 'Notification preferences verified',
      created: false,
    });
  } catch (error) {
    console.error('Initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
