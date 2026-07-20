import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUserOrThrow, unauthorizedResponse } from '@/lib/security/auth';

export async function POST(request: NextRequest) {
  try {
    let user;
    try {
      user = await getAuthenticatedUserOrThrow(request);
    } catch {
      return unauthorizedResponse('User not authenticated');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const businessId = formData.get('businessId') as string;

    if (!file || !businessId) {
      return NextResponse.json({ error: 'Missing file or businessId' }, { status: 400 });
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: 'File is too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    const { data: business, error: businessError } = await adminSupabase
      .from('businesses')
      .select('id, user_id')
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (business.user_id !== user.id) {
      return unauthorizedResponse('You do not own this business');
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${user.id}/${businessId}-${Date.now()}.${ext}`;
    const buffer = await file.arrayBuffer();

    const { error: uploadError } = await adminSupabase.storage
      .from('business-logos')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      const lower = uploadError.message?.toLowerCase() || '';
      if (lower.includes('bucket') || lower.includes('not found')) {
        return NextResponse.json(
          {
            error:
              'SETUP NEEDED: Create a public Storage bucket named "business-logos" in Supabase Storage.',
          },
          { status: 500 }
        );
      }

      if (lower.includes('row-level security') || lower.includes('violates row-level security')) {
        return NextResponse.json(
          {
            error:
              'RLS ERROR: Server upload is not using a valid service role key. In Vercel/Supabase env, set SUPABASE_SERVICE_ROLE_KEY to the Secret service_role key (not anon/publishable), then redeploy.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 });
    }

    const { data: publicUrlData } = adminSupabase.storage.from('business-logos').getPublicUrl(filePath);
    const imageUrl = publicUrlData?.publicUrl;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to build public image URL' }, { status: 500 });
    }

    const { error: updateError } = await adminSupabase
      .from('businesses')
      .update({ logo_url: imageUrl })
      .eq('id', businessId)
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save logo URL' }, { status: 500 });
    }

    return NextResponse.json({ success: true, imageUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}