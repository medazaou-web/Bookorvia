import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '../../../lib/supabase/admin';
import { createServerSupabase } from '@/lib/supabase/serverClient';
import { getAuthenticatedUserOrThrow, unauthorizedResponse } from '@/lib/security/auth';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify user is authenticated
    let user;
    try {
      user = await getAuthenticatedUserOrThrow(request);
    } catch {
      return unauthorizedResponse('User not authenticated');
    }

    const body = await request.json();
    const { bookingId, newStatus } = body;

    console.log("📧 send-booking-status-update from user:", user.id, { bookingId, newStatus });

    if (!bookingId || !newStatus) {
      console.error("❌ Missing fields:", { bookingId, newStatus });
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, newStatus' },
        { status: 400 }
      );
    }

    const supabaseAuth = createServerSupabase();

    // Fetch booking details
    console.log("🔍 Fetching booking with ID:", bookingId);
    const { data: booking, error: fetchError } = await supabaseAuth
      .from('booking_requests')
      .select('business_id, *')
      .eq('id', bookingId)
      .single();

    console.log("🔍 Fetch result:", { hasData: !!booking, error: fetchError?.message });

    if (fetchError || !booking) {
      console.error("❌ Booking not found:", { bookingId, error: fetchError?.message });
      return NextResponse.json(
        { error: 'Booking not found', details: fetchError?.message },
        { status: 404 }
      );
    }

    // SECURITY: Verify the booking's business belongs to the authenticated user
    const { data: business, error: businessError } = await supabaseAuth
      .from('businesses')
      .select('id, user_id')
      .eq('id', booking.business_id)
      .single();

    if (businessError || !business || business.user_id !== user.id) {
      return unauthorizedResponse('You do not own the business for this booking');
    }

    const supabase = createAdminClient();

    // Send email if client email exists (regardless of notification_enabled)
    if (!booking.client_email) {
      console.log('📧 No client email found for booking:', bookingId);
      return NextResponse.json(
        { 
          success: true,
          message: 'Booking updated but no email sent (no client email)',
        },
        { status: 200 }
      );
    }

    // Get business owner's notification preferences
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('email_notifications_enabled, email_status_notifications')
      .eq('id', business.user_id)
      .single();

    const emailNotificationsEnabled = (ownerProfile as any)?.email_notifications_enabled ?? true;
    const emailStatusNotifications = (ownerProfile as any)?.email_status_notifications ?? true;

    // Skip email if owner has notifications disabled
    if (!emailNotificationsEnabled || !emailStatusNotifications) {
      console.log('📧 Email notifications disabled for business owner:', bookingId);
      return NextResponse.json(
        { 
          success: true,
          message: 'Booking updated but email not sent (notifications disabled)',
        },
        { status: 200 }
      );
    }

    console.log('📧 Sending status update email to:', booking.client_email);
    console.log('📧 Booking data:', { id: booking.id, client_name: booking.client_name, client_email: booking.client_email });

    // Fetch business details
    const { data: businessDetails } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', booking.business_id)
      .single();

    console.log('📧 Business data:', { business_name: businessDetails?.name });

    // Send notification email via the send-booking-notification endpoint
    const emailPayload = {
      bookingId,
      clientEmail: booking.client_email,
      clientName: booking.client_name,
      status: newStatus,
      businessName: businessDetails?.name,
      serviceName: booking.service,
      bookingDate: booking.requested_date,
      bookingTime: booking.requested_time,
    };
    
    console.log('📧 Email payload:', emailPayload);

    const notificationResponse = await fetch(
      new URL('/api/send-booking-notification', request.url),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(request.headers.get('authorization')
            ? { Authorization: request.headers.get('authorization') as string }
            : {}),
        },
        body: JSON.stringify(emailPayload),
      }
    );

    console.log('📧 Email API response status:', notificationResponse.status);

    if (!notificationResponse.ok) {
      const errorText = await notificationResponse.text();
      console.error('❌ Email API error:', errorText);
      // Still return success since booking was updated
    } else {
      const successData = await notificationResponse.json();
      console.log('✅ Email sent successfully:', successData);
    }

    return NextResponse.json(
      { 
        success: true,
        message: `Booking status updated and email sent to ${booking.client_email}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending status update email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
