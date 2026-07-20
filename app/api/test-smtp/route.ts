import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserOrThrow, verifyIsAdmin, unauthorizedResponse } from '@/lib/security/auth';
import nodemailer from 'nodemailer';

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
      return unauthorizedResponse('Only admins can test SMTP configuration');
    }

    console.log("🧪 Testing SMTP connection... (Admin:", user.id, ")");
    
    // Check environment variables
    const config = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD ? '***' : 'NOT SET',
      fromEmail: process.env.SMTP_FROM_EMAIL,
      fromName: process.env.SMTP_FROM_NAME,
    };
    
    console.log("📋 SMTP Configuration:", config);
    
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing SMTP configuration',
        config,
      }, { status: 400 });
    }

    // Create transporter for this request (picks up current env variables)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify connection
    console.log("🔍 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully!");

    // Send test email
    const testEmail = request.nextUrl.searchParams.get('email') || process.env.SMTP_USER;
    console.log("📧 Sending test email to:", testEmail);
    
    const info = await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME || 'Bookorvia'} <${process.env.SMTP_FROM_EMAIL || 'no-reply@bookorvia.com'}>`,
      to: testEmail,
      subject: '🧪 Bookorvia SMTP Test',
      html: `
        <h2>SMTP Connection Test Successful!</h2>
        <p>If you received this email, your SMTP configuration is working correctly.</p>
        <hr>
        <p><strong>Test Details:</strong></p>
        <ul>
          <li>Host: ${process.env.SMTP_HOST}</li>
          <li>Port: ${process.env.SMTP_PORT}</li>
          <li>From: ${process.env.SMTP_FROM_EMAIL}</li>
          <li>To: ${testEmail}</li>
          <li>Time: ${new Date().toISOString()}</li>
        </ul>
      `,
    });

    console.log("✅ Test email sent:", { messageId: info.messageId });

    return NextResponse.json({
      status: 'success',
      message: 'SMTP test passed! Check your email.',
      details: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        fromEmail: process.env.SMTP_FROM_EMAIL,
        toEmail: testEmail,
        messageId: info.messageId,
      },
    });
  } catch (error: any) {
    console.error('❌ SMTP Test Error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      code: error.code,
      details: error.response,
    }, { status: 500 });
  }
}
