import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '../../../lib/supabase/admin';
import { createServerSupabase } from '@/lib/supabase/serverClient';
import { getAuthenticatedUserOrThrow, unauthorizedResponse } from '@/lib/security/auth';
import nodemailer from 'nodemailer';

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

    // Send client confirmation/update email directly here so accepted/refused emails are reliable.
    const from = `${process.env.SMTP_FROM_NAME || 'Bookorvia'} <${process.env.SMTP_FROM_EMAIL || 'no-reply@bookorvia.com'}>`;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const trackingLink = `${baseUrl}/booking-status/${bookingId}`;

    const statusMessages = {
      pending: {
        subject: 'Booking Request Received - Awaiting Confirmation',
        heading: 'Your booking request has been received!',
        message: 'The business will review your request and confirm shortly. We\'ll notify you as soon as there\'s an update.',
        icon: '⏳',
        color: '#f59e0b',
      },
      accepted: {
        subject: '✓ Your Booking is Confirmed!',
        heading: 'Great news! Your booking is confirmed',
        message: 'Your booking has been accepted and confirmed. Please check the details below.',
        icon: '✓',
        color: '#10b981',
      },
      refused: {
        subject: 'Booking Update - Slot Not Available',
        heading: 'Booking Status Update',
        message: 'Unfortunately, the requested time slot is no longer available. Please try booking another time.',
        icon: '✗',
        color: '#ef4444',
      },
      completed: {
        subject: 'Service Completed - Thank You!',
        heading: 'Your service is complete',
        message: 'Thank you for booking with us! We hope you had a great experience.',
        icon: '✓',
        color: '#3b82f6',
      },
    } as const;

    const emailData = statusMessages[newStatus as keyof typeof statusMessages] || statusMessages.accepted;
    const clientEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
            .status-badge { display: inline-block; background: ${emailData.color}; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${emailData.color}; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 600; color: #666; }
            .detail-value { color: #333; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">${emailData.icon}</h1>
              <h2 style="margin: 10px 0 0 0;">${emailData.heading}</h2>
            </div>
            <div class="content">
              <p>${emailData.message}</p>
              <div class="status-badge">${emailData.icon} ${newStatus.toUpperCase()}</div>
              <div class="details">
                <div class="detail-row"><span class="detail-label">Name:</span><span class="detail-value">${booking.client_name || 'Valued Customer'}</span></div>
                ${businessDetails?.name ? `<div class="detail-row"><span class="detail-label">Business:</span><span class="detail-value">${businessDetails.name}</span></div>` : ''}
                ${booking.service ? `<div class="detail-row"><span class="detail-label">Service:</span><span class="detail-value">${booking.service}</span></div>` : ''}
                ${booking.requested_date ? `<div class="detail-row"><span class="detail-label">Date:</span><span class="detail-value">${booking.requested_date}</span></div>` : ''}
                ${booking.requested_time ? `<div class="detail-row"><span class="detail-label">Time:</span><span class="detail-value">${booking.requested_time}</span></div>` : ''}
              </div>
              <div style="text-align: center;">
                <a href="${trackingLink}" class="cta-button">View Your Booking</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from,
        to: booking.client_email,
        subject: emailData.subject,
        html: clientEmailHtml,
      });
      console.log('✅ Client status email sent successfully to:', booking.client_email);
    } catch (smtpError: any) {
      console.error('❌ Client status email failed:', smtpError?.message || smtpError);
      return NextResponse.json(
        {
          success: false,
          emailSent: false,
          error: smtpError?.message || 'Failed to send client status email',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        emailSent: true,
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
