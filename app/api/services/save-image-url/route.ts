import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUserOrThrow, unauthorizedResponse } from '@/lib/security/auth';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Get authenticated user from server-side token, don't trust client
    let user;
    try {
      user = await getAuthenticatedUserOrThrow(request);
    } catch {
      return unauthorizedResponse('User not authenticated');
    }

    const { serviceId, imageUrl } = await request.json();

    if (!serviceId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing serviceId or imageUrl' },
        { status: 400 }
      );
    }

    console.log('⚡ [save-image-url] Saving image for service:', serviceId, 'User:', user.id);

    // Use admin client for database operations
    const adminSupabase = createAdminClient();

    // OPTIMIZED: Fetch service with business relationship in single query (2x faster!)
    const { data: service, error: serviceError } = await adminSupabase
      .from('services')
      .select('id, business_id, businesses!inner(user_id)')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      console.error('❌ [save-image-url] Service query error:', serviceError?.message);
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const business = (service as any).businesses;
    if (!business) {
      console.error('❌ [save-image-url] Business not found');
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // SECURITY: Verify authenticated user owns the service's business
    const ownsService = business?.user_id === user.id;
    if (!ownsService) {
      console.error('❌ [save-image-url] Unauthorized access attempt. User:', user.id, 'Owner:', business?.user_id);
      return unauthorizedResponse('You do not own this service');
    }

    console.log('✅ [save-image-url] Authorization passed');

    // Update service with image URL
    const { error: updateError } = await adminSupabase
      .from('services')
      .update({ background_image_url: imageUrl })
      .eq('id', serviceId);

    if (updateError) {
      console.error('❌ [save-image-url] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to save image URL to database' },
        { status: 500 }
      );
    }

    console.log('✅ [save-image-url] Service updated successfully');

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      message: 'Image saved successfully'
    });
  } catch (err: any) {
    console.error('❌ [save-image-url] Unexpected error:', err.message);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
