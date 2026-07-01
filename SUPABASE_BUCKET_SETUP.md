# Supabase Storage Bucket Setup Guide

## Fix "Bucket not found" Error for Business Logo Upload

The error "Bucket not found" occurs when the `business-logos` storage bucket hasn't been created yet in Supabase. Follow these steps to fix it.

### Step 1: Access Supabase Dashboard

1. Go to https://supabase.com
2. Log in with your account
3. Select your project (e.g., "Bookorvia" or "clientloop")
4. In the left sidebar, click **Storage**

### Step 2: Create the Bucket

1. Click the **Create a new bucket** button
2. Enter the bucket name exactly: `business-logos`
3. Choose privacy settings:
   - **Public bucket** - Recommended (so users can view logos)
   - Keep default settings
4. Click **Create bucket**

### Step 3: Configure Storage Access Control (RLS)

Once the bucket is created:

1. Click on the `business-logos` bucket
2. Go to the **Policies** tab
3. Click **Create policy**

#### Policy 1: Allow users to upload to their own folder

1. Choose "For full customization, use custom expression"
2. Set the policy:
   - **Policy name**: "Allow authenticated users to upload logos"
   - **Allowed operation**: SELECT, INSERT, UPDATE
   - **Role**: authenticated
   - **Custom expression**:
   ```
   (bucket_id = 'business-logos' AND (auth.uid())::text = (storage.foldername(name))[1])
   ```

3. Click **Create policy**

#### Policy 2: Allow public read access

1. Click **Create policy** again
2. Choose "For full customization, use custom expression"
3. Set the policy:
   - **Policy name**: "Allow public read access"
   - **Allowed operation**: SELECT
   - **Role**: anon
   - **Custom expression**:
   ```
   bucket_id = 'business-logos'
   ```

4. Click **Create policy**

### Step 4: Verify Upload Path Structure

The code uses this path structure:
```
business-logos/
└── {user_id}/
    └── {business_id}-{timestamp}.{extension}
```

**Example:**:
```
business-logos/
└── 550e8400-e29b-41d4-a716-446655440000/
    └── b1234567-e89b-12d3-a456-426614174000-1710000000000.png
```

This structure ensures:
- ✅ Users can only access their own `{user_id}` folder (RLS security)
- ✅ Multiple businesses per user are supported
- ✅ Timestamps prevent filename collisions

### Step 5: Test the Upload

1. Go to your app: http://localhost:3000/dashboard/settings
2. Scroll to "Business Logo" section
3. Click "Upload Logo" or drag-and-drop a PNG/JPG/WEBP image
4. Check browser console (F12 → Console) for debug logs:
   - ✓ Success: `"Logo uploaded successfully:"`
   - ✗ Error: `"Logo upload error:"` (shows full error details)

### Step 6: Verify in Supabase

After uploading:

1. Go to Supabase Storage → `business-logos` bucket
2. You should see your folder structure:
   ```
   business-logos/
   └── your-user-id/
       └── your-business-id-1710000000000.png
   ```

3. Click the file to see the public URL
4. The public URL should be stored in your `businesses` table `logo_url` column

### Troubleshooting

**If you still see "Bucket not found":**
1. ✓ Verify bucket name is exactly `business-logos` (lowercase, with hyphen)
2. ✓ Check RLS policies are created and enabled
3. ✓ Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
4. ✓ Check browser console for full error message (press F12 → Console tab)

**If upload succeeds but preview doesn't show:**
1. ✓ Check that `logo_url` is saved to `businesses` table
2. ✓ Verify the public URL is accessible (try opening it in browser)
3. ✓ Hard-refresh the page (Ctrl+Shift+R)

**If public page doesn't show logo:**
1. ✓ Go to `/b/your-slug` to check
2. ✓ Verify Supabase auth is set (should redirect to `/login?next=...` if not logged in)
3. ✓ Check that `logo_url` is populated in database for your business

### Code Changes Made

**File**: `app/dashboard/settings/page.tsx`

Enhanced error handling:
- ✓ Better error messages for "Bucket not found"
- ✓ Console logging for debugging
- ✓ Friendly UI error messages
- ✓ Proper error propagation

**Bucket name used**: `business-logos` (exact match required)

**Upload path format**: `${user.id}/${business.id}-${Date.now()}.${extension}`

### Questions?

If you have issues:
1. Check browser console (F12) for full error messages
2. Verify bucket exists in Supabase Storage dashboard
3. Check RLS policies are configured correctly
4. Verify CORS settings if accessing from different domain
