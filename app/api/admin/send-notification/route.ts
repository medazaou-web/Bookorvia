import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUserOrThrow, verifyIsAdmin, unauthorizedResponse } from '@/lib/security/auth';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { 
      userIds,
      sendToAll,
      type,
      title,
      message,
      icon,
    } = body;

    console.log("📢 Admin notification request from admin:", user.id, { sendToAll, type, userIds: userIds?.length || 0 });

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, message' },
        { status: 400 }
      );
    }

    // Validate notification type
    const validTypes = ['announcement', 'issue', 'update', 'maintenance'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get list of user IDs to notify
    let targetUserIds: string[] = [];
    let emailMap = new Map<string, string | undefined>();
    
    if (sendToAll) {
      console.log("⚡ DEBUG: Optimized bulk fetch for all users...");
      
      // Fetch all auth users at once (single batch call) - OPTIMIZED N+1 FIX
      const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
      emailMap = new Map(authUsers.map(u => [u.id, u.email]));
      targetUserIds = Array.from(emailMap.keys());
      
      console.log("✅ Fetched", targetUserIds.length, "users with emails (no N+1!)");
    } else if (userIds && userIds.length > 0) {
      targetUserIds = userIds;
      
      // Fetch emails for selected users only
      const { data: { users: selectedAuthUsers } } = await supabase.auth.admin.listUsers();
      emailMap = new Map(
        selectedAuthUsers
          .filter(u => userIds.includes(u.id))
          .map(u => [u.id, u.email])
      );
      console.log("✅ Sending to selected", targetUserIds.length, "users");
    } else {
      return NextResponse.json(
        { error: 'Either sendToAll must be true or userIds array must be provided' },
        { status: 400 }
      );
    }

    // Optimized: Single query for user details
    const { data: profiles, error: profileDetailError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', targetUserIds)
      .limit(10000); // Add pagination

    if (profileDetailError) {
      console.error("❌ Error fetching user details:", profileDetailError);
      return NextResponse.json(
        { error: 'Failed to fetch user details' },
        { status: 500 }
      );
    }

    console.log("✅ Found", profiles?.length || 0, "profiles");

    // OPTIMIZED: Use pre-fetched email map (no additional API calls)
    const usersWithEmails = (profiles || [])
      .map((profile: any) => ({
        id: profile.id,
        name: profile.full_name,
        email: emailMap.get(profile.id) || '',
      }))
      .filter(u => u.email);

    // Get businesses for these users - OPTIMIZED: single query
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, user_id, name')
      .in('user_id', targetUserIds)
      .limit(50000);

    const uniqueBusinessOwnerIds = new Set((businesses || []).map((b: any) => b.user_id));
    const usersWithoutBusinessCount = Math.max(0, targetUserIds.length - uniqueBusinessOwnerIds.size);

    // OPTIMIZED: Batch insert notifications instead of individual inserts
    let inAppNotificationsSent = 0;
    if (businesses && businesses.length > 0) {
      // DB table can enforce legacy type constraints; store a safe DB type and keep admin type in data.
      const dbType = 'update';
      const notifications = businesses.map(business => ({
        business_id: business.id,
        type: dbType,
        title,
        message,
        data: {
          icon,
          adminType: type,
          isAdmin: true,
          timestamp: new Date().toISOString(),
        },
        read: false,
      }));

      const { error: batchError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (batchError) {
        console.error(`❌ Failed to batch insert notifications:`, batchError);
        return NextResponse.json(
          { error: `Failed to create in-app notifications: ${batchError.message}` },
          { status: 500 }
        );
      }

      inAppNotificationsSent = notifications.length;
      console.log(`✅ Batch inserted ${inAppNotificationsSent} in-app notifications`);
    }

    // Send emails if configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });

        const typeColors: { [key: string]: string } = {
          announcement: '#3b82f6',
          issue: '#ef4444',
          update: '#10b981',
          maintenance: '#f59e0b',
        };

        const typeEmojis: { [key: string]: string } = {
          announcement: '📢',
          issue: '⚠️',
          update: '✨',
          maintenance: '🔧',
        };

        const htmlTemplate = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, ${typeColors[type] || '#3b82f6'} 0%, ${typeColors[type] || '#3b82f6'}dd 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
                .header h1 { margin: 0; font-size: 24px; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .message { background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px; }
                .footer { font-size: 12px; color: #666; margin-top: 20px; text-align: center; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${typeEmojis[type] || icon || '📬'} ${title}</h1>
                </div>
                <div class="content">
                  <div class="message">
                    ${message.split('\n').map((line: string) => `<p>${line}</p>`).join('')}
                  </div>
                  <div class="footer">
                    <p>Sent by Bookorvia Admin</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

        const emailPromises = usersWithEmails
          .filter(user => user.email)
          .map(async (user: any) => {
            try {
              // Check if user has admin notifications enabled
              // Admin announcements are NOT affected by the master toggle
              const { data: profileData } = await supabase
                .from('profiles')
                .select('email_admin_notifications')
                .eq('id', user.id)
                .single();

              const emailAdminNotifications = (profileData as any)?.email_admin_notifications ?? true;

              // Skip only if admin notifications are explicitly disabled
              // Master toggle does NOT affect admin announcements
              if (!emailAdminNotifications) {
                console.log(`⚠️  Admin notifications disabled for user ${user.id}`);
                return;
              }

              await transporter.sendMail({
                from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
                to: user.email,
                subject: `${typeEmojis[type] || icon || '📬'} ${title}`,
                html: htmlTemplate,
              });

              console.log(`✅ Email sent to ${user.email}`);
            } catch (err) {
              console.error(`❌ Failed to send email to user ${user.id}:`, err);
            }
          });

        await Promise.all(emailPromises);
      } catch (err) {
        console.error("❌ Email sending error:", err);
        // Don't fail if email fails - in-app notifications still created
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Notification delivered to ${inAppNotificationsSent} in-app inboxes`,
        notificationsSent: inAppNotificationsSent,
        usersTargeted: targetUserIds.length,
        usersWithoutBusiness: usersWithoutBusinessCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Admin notification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}
