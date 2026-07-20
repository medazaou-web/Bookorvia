import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Define all buckets that need to exist
const BUCKETS = [
  { name: 'service-images', public: true, fileSizeLimit: 10485760 }, // 10MB
  { name: 'business-covers', public: true, fileSizeLimit: 10485760 }, // 10MB
  { name: 'business-logos', public: true, fileSizeLimit: 5242880 }, // 5MB
];

export async function POST(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient();
    
    console.log('🔧 [init-bucket] Initializing all storage buckets...');
    
    // Get query param to create specific bucket or all
    const { searchParams } = new URL(request.url);
    const bucketType = searchParams.get('type');
    
    // Filter buckets to create
    let bucketsToCreate = BUCKETS;
    if (bucketType) {
      bucketsToCreate = BUCKETS.filter(b => b.name === bucketType);
      if (bucketsToCreate.length === 0) {
        return NextResponse.json(
          { error: `Unknown bucket type: ${bucketType}` },
          { status: 400 }
        );
      }
    }
    
    // Try to list existing buckets
    const { data: buckets, error: listError } = await adminSupabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ [init-bucket] Error listing buckets:', listError);
      return NextResponse.json(
        { error: `Failed to list buckets: ${listError.message}` },
        { status: 500 }
      );
    }
    
    const existingBucketNames = buckets?.map(b => b.name) || [];
    console.log('📋 [init-bucket] Existing buckets:', existingBucketNames.join(', '));
    
    const results = [];
    
    // Create each bucket that doesn't exist
    for (const bucket of bucketsToCreate) {
      if (existingBucketNames.includes(bucket.name)) {
        console.log(`✅ [init-bucket] Bucket ${bucket.name} already exists`);
        results.push({ bucket: bucket.name, status: 'exists' });
        continue;
      }
      
      console.log(`📦 [init-bucket] Creating bucket ${bucket.name}...`);
      
      const { data: createData, error: createError } = await adminSupabase.storage.createBucket(
        bucket.name,
        {
          public: bucket.public,
          fileSizeLimit: bucket.fileSizeLimit,
        }
      );
      
      if (createError) {
        console.error(`❌ [init-bucket] Error creating ${bucket.name}:`, createError);
        results.push({ bucket: bucket.name, status: 'failed', error: createError.message });
      } else {
        console.log(`✅ [init-bucket] Bucket ${bucket.name} created successfully`);
        results.push({ bucket: bucket.name, status: 'created' });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bucket initialization completed',
      results
    });
  } catch (err: any) {
    console.error('❌ [init-bucket] Unexpected error:', err.message);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
