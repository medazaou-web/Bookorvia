import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserOrThrow, verifyBusinessOwnership, unauthorizedResponse } from '@/lib/security/auth';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify user is authenticated
    let user;
    try {
      user = await getAuthenticatedUserOrThrow(request);
    } catch {
      return unauthorizedResponse('User not authenticated');
    }

    const { businessId, businessOwnerId, businessName, businessOwnerEmail, type, subject, html } = await request.json();

    // SECURITY: Verify required fields
    if (!businessId || !businessOwnerEmail || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: businessId, businessOwnerEmail, subject, html' },
        { status: 400 }
      );
    }

    // SECURITY: Verify user owns this business
    const ownsBusinessLocation = await verifyBusinessOwnership(businessId, user.id);
    if (!ownsBusinessLocation) {
      return unauthorizedResponse('You do not own this business');
    }

    // SECURITY: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(businessOwnerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

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

    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: businessOwnerEmail,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`📧 Notification email sent to ${businessOwnerEmail}:`, info.messageId);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error: any) {
    console.error('❌ Failed to send notification email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification email' },
      { status: 500 }
    );
  }
}
