import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient();
    
    console.log('🔧 [init-bucket] Initializing service-images bucket...');
    
    // Try to list buckets first
    const { data: buckets, error: listError } = await adminSupabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ [init-bucket] Error listing buckets:', listError);
      return NextResponse.json(
        { error: `Failed to list buckets: ${listError.message}` },
        { status: 500 }
      );
    }
    
    const bucketExists = buckets?.some(b => b.name === 'service-images');
    
    if (bucketExists) {
      console.log('✅ [init-bucket] Bucket service-images already exists');
      return NextResponse.json({ 
        success: true, 
        message: 'Bucket service-images already exists'
      });
    }
    
    // Create the bucket if it doesn't exist
    console.log('📦 [init-bucket] Creating service-images bucket...');
    
    const { data: createData, error: createError } = await adminSupabase.storage.createBucket(
      'service-images',
      {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      }
    );
    
    if (createError) {
      console.error('❌ [init-bucket] Error creating bucket:', createError);
      return NextResponse.json(
        { error: `Failed to create bucket: ${createError.message}` },
        { status: 500 }
      );
    }
    
    console.log('✅ [init-bucket] Bucket service-images created successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bucket service-images created successfully',
      bucket: createData
    });
  } catch (err: any) {
    console.error('❌ [init-bucket] Unexpected error:', err.message);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
