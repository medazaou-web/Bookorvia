import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createAdminClient } from '@/lib/supabase/admin';

function getFromAddress() {
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'no-reply@bookorvia.com';
  const fromName = process.env.SMTP_FROM_NAME || 'Bookorvia';
  return `${fromName} <${fromEmail}>`;
}

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return NextResponse.json({ error: 'SMTP configuration missing' }, { status: 500 });
    }

    const supabase = createAdminClient();

    const { data: booking, error: bookingErr } = await supabase
      .from('booking_requests')
      .select('id, business_id, client_name, client_email, service, services_json, requested_date, requested_time, status, message')
      .eq('id', bookingId)
      .single();

    if (bookingErr || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const { data: business, error: bizErr } = await supabase
      .from('businesses')
      .select('id, name, user_id')
      .eq('id', booking.business_id)
      .single();

    if (bizErr || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('email_notifications_enabled, email_booking_notifications')
      .eq('id', business.user_id)
      .single();

    const ownerWantsBookingEmails =
      (ownerProfile as any)?.email_notifications_enabled !== false &&
      (ownerProfile as any)?.email_booking_notifications !== false;

    const { data: ownerAuth, error: ownerAuthErr } = await supabase.auth.admin.getUserById(business.user_id);
    const ownerEmail = ownerAuth?.user?.email;

    if (ownerAuthErr) {
      console.error('Owner auth lookup error:', ownerAuthErr);
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const from = getFromAddress();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create in-app notification for business owner dashboard bell
    try {
      const { error: notificationErr } = await supabase.from('notifications').insert({
        business_id: booking.business_id,
        type: 'booking',
        title: 'New Booking Received',
        message: `${booking.client_name || 'A client'} booked ${booking.service || 'a service'} for ${booking.requested_date || 'a date'} at ${booking.requested_time || 'a time'}`,
        data: {
          icon: '📅',
          bookingId: booking.id,
          isAdmin: false,
          source: 'public-booking',
          timestamp: new Date().toISOString(),
        },
        read: false,
      });

      if (notificationErr) {
        console.error('Failed to create in-app booking notification:', notificationErr.message);
      }
    } catch (notificationCatchErr: any) {
      console.error('Error creating in-app booking notification:', notificationCatchErr?.message || notificationCatchErr);
    }

    let ownerEmailSent = false;
    let clientEmailSent = false;
    const errors: string[] = [];

    if (ownerEmail && ownerWantsBookingEmails) {
      const ownerSubject = `New Booking: ${(booking.client_name || 'Client')} - ${booking.requested_date || ''} ${booking.requested_time || ''}`.trim();
      const ownerHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #4f46e5, #2563eb); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">New Booking Received</h1>
          </div>
          <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 16px 0; font-size: 16px;">You have received a new booking request.</p>
            <div style="background: white; padding: 16px; border-left: 4px solid #4f46e5; margin: 16px 0; border-radius: 4px;">
              <p style="margin: 8px 0;"><strong>Client:</strong> ${booking.client_name || 'Unknown'}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${booking.client_email || 'N/A'}</p>
              <p style="margin: 8px 0;"><strong>Service:</strong> ${booking.service || 'N/A'}</p>
              <p style="margin: 8px 0;"><strong>Date:</strong> ${booking.requested_date || 'N/A'}</p>
              <p style="margin: 8px 0;"><strong>Time:</strong> ${booking.requested_time || 'N/A'}</p>
            </div>
            <p style="margin: 16px 0; text-align: center;">
              <a href="${appUrl}/dashboard/bookings" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Open Dashboard</a>
            </p>
          </div>
        </div>
      `;

      try {
        await transporter.sendMail({
          from,
          to: ownerEmail,
          subject: ownerSubject,
          html: ownerHtml,
        });

        ownerEmailSent = true;
      } catch (ownerMailErr: any) {
        const ownerMsg = ownerMailErr?.message || 'unknown owner email error';
        console.error('Owner email send failed:', ownerMsg);
        errors.push(`owner: ${ownerMsg}`);
      }
    }

    if (booking.client_email) {
      const clientSubject = 'Booking Request Received - Awaiting Confirmation';
      const clientHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #4f46e5, #2563eb); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Booking Request Received</h1>
          </div>
          <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 12px 12px;">
            <p>Hello ${booking.client_name || 'there'},</p>
            <p>Your booking request has been received and is awaiting confirmation.</p>
            <div style="background: white; padding: 16px; border-left: 4px solid #4f46e5; margin: 16px 0; border-radius: 4px;">
              <p style="margin: 8px 0;"><strong>Business:</strong> ${business.name || 'Bookorvia Business'}</p>
              <p style="margin: 8px 0;"><strong>Service:</strong> ${booking.service || 'N/A'}</p>
              <p style="margin: 8px 0;"><strong>Date:</strong> ${booking.requested_date || 'N/A'}</p>
              <p style="margin: 8px 0;"><strong>Time:</strong> ${booking.requested_time || 'N/A'}</p>
            </div>
            <p style="margin: 16px 0; text-align: center;">
              <a href="${appUrl}/booking-status/${booking.id}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Booking Status</a>
            </p>
          </div>
        </div>
      `;

      try {
        await transporter.sendMail({
          from,
          to: booking.client_email,
          subject: clientSubject,
          html: clientHtml,
        });

        clientEmailSent = true;
      } catch (clientMailErr: any) {
        const clientMsg = clientMailErr?.message || 'unknown client email error';
        console.error('Client email send failed:', clientMsg);
        errors.push(`client: ${clientMsg}`);
      }
    }

    if (!ownerEmailSent && !clientEmailSent) {
      return NextResponse.json(
        {
          success: false,
          ownerEmailSent,
          clientEmailSent,
          errors,
          error: 'Failed to send both owner and client emails',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ownerEmailSent,
      clientEmailSent,
      errors,
      message:
        ownerEmailSent && clientEmailSent
          ? 'Owner and client emails sent successfully'
          : ownerEmailSent
          ? 'Owner email sent, client email failed'
          : 'Client email sent, owner email failed',
    });
  } catch (error: any) {
    console.error('Error sending booking emails:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to send booking emails',
        details: error?.response || error?.code || null,
      },
      { status: 500 }
    );
  }
}