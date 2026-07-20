import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createAdminClient } from '../../../lib/supabase/admin';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/security/auth';

type BookingStatus = 'pending' | 'accepted' | 'completed' | 'refused';

interface EmailRequest {
  bookingId: string;
  clientEmail: string;
  clientName: string;
  status: BookingStatus;
  businessName?: string;
  serviceName?: string;
  bookingDate?: string;
  bookingTime?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Auth is optional here: business dashboards are authenticated, client-side booking tracker is public.
    const user = await getAuthenticatedUser(request);

    const body: EmailRequest = await request.json();
    let { bookingId, clientEmail, clientName, status, businessName, serviceName, bookingDate, bookingTime } = body;

    console.log("📧 Email Request Received:", { bookingId, clientEmail, clientName, status, requester: user?.id || 'public' });

    const supabase = createAdminClient();

    // SECURITY: Fetch booking record for validation
    const { data: booking, error: bookingError } = await supabase
      .from('booking_requests')
      .select('id, business_id, client_email')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // If authenticated, verify requester owns the booking business.
    // If public, verify the provided email matches the booking's stored client email.
    if (user?.id) {
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id, user_id')
        .eq('id', booking.business_id)
        .single();

      if (businessError || !business || business.user_id !== user.id) {
        return unauthorizedResponse('You do not own the business for this booking');
      }
    } else {
      const matchesClient =
        !!booking.client_email &&
        booking.client_email.toLowerCase() === (clientEmail || '').toLowerCase();

      if (!matchesClient) {
        return unauthorizedResponse('Public email notification request does not match booking email');
      }
    }

    // SECURITY: Check that the booking's business belongs to the authenticated user
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('id', booking.business_id)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found for booking' },
        { status: 404 }
      );
    }

    // Use fallback for empty clientName
    if (!clientName) {
      clientName = 'Valued Customer';
      console.log("⚠️  clientName was empty, using fallback:", clientName);
    }

    // Validate required fields
    if (!bookingId || !clientEmail || !status) {
      console.error("❌ Missing fields:", { bookingId, clientEmail, status });
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, clientEmail, status' },
        { status: 400 }
      );
    }

    // Check SMTP configuration
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error("❌ Missing SMTP configuration");
      return NextResponse.json(
        { error: 'SMTP configuration missing' },
        { status: 500 }
      );
    }

    console.log("✅ SMTP Configured:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
    });

    // Create transporter for this request (picks up current env variables)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports (uses STARTTLS)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Prepare email content based on status
    const getEmailContent = () => {
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
      };

      const emailData = statusMessages[status];

      return {
        subject: emailData.subject,
        html: `
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
                  
                  <div class="status-badge">${emailData.icon} ${status.toUpperCase()}</div>
                  
                  <div class="details">
                    <div class="detail-row">
                      <span class="detail-label">Name:</span>
                      <span class="detail-value">${clientName}</span>
                    </div>
                    ${businessName ? `
                    <div class="detail-row">
                      <span class="detail-label">Business:</span>
                      <span class="detail-value">${businessName || business.name || 'Bookorvia Business'}</span>
                    </div>
                    ` : ''}
                    ${serviceName ? `
                    <div class="detail-row">
                      <span class="detail-label">Service:</span>
                      <span class="detail-value">${serviceName}</span>
                    </div>
                    ` : ''}
                    ${bookingDate ? `
                    <div class="detail-row">
                      <span class="detail-label">Date:</span>
                      <span class="detail-value">${bookingDate}</span>
                    </div>
                    ` : ''}
                    ${bookingTime ? `
                    <div class="detail-row">
                      <span class="detail-label">Time:</span>
                      <span class="detail-value">${bookingTime}</span>
                    </div>
                    ` : ''}
                    <div class="detail-row">
                      <span class="detail-label">Booking ID:</span>
                      <span class="detail-value" style="font-family: monospace; font-size: 12px;">${bookingId.slice(0, 8)}...</span>
                    </div>
                  </div>
                  
                  <div style="text-align: center;">
                    <a href="${trackingLink}" class="cta-button">View Your Booking</a>
                  </div>
                  
                  <p style="color: #666; font-size: 14px;">
                    You're receiving this email because you requested to be notified of changes to your booking status. 
                    You can track your booking anytime by visiting the link above.
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Bookorvia - Professional Booking & Loyalty Management</p>
                  <p>This is an automated message, please do not reply to this email.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };
    };

    const emailContent = getEmailContent();

    // Send email
    console.log("📨 Attempting to send email...", { to: clientEmail, subject: emailContent.subject });
    
    try {
      const info = await transporter.sendMail({
        from: `${process.env.SMTP_FROM_NAME || 'Bookorvia'} <${process.env.SMTP_FROM_EMAIL || 'no-reply@bookorvia.com'}>`,
        to: clientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
      
      console.log("✅ Email sent successfully:", { messageId: info.messageId, to: clientEmail });
    } catch (smtpError: any) {
      console.error("❌ SMTP Error:", {
        message: smtpError.message,
        code: smtpError.code,
        command: smtpError.command,
      });
      throw smtpError;
    }

    return NextResponse.json(
      { 
        success: true, 
        message: `Email sent successfully to ${clientEmail}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Email sending error:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
