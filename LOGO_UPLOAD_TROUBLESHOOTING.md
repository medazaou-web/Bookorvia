# Logo Upload Troubleshooting Checklist

## Issue: "Bucket not found" Error

### ✓ Code-Level Checks (Already Fixed)
- [x] Bucket name: `business-logos` (lowercase with hyphen)
- [x] Upload path: `${user.id}/${business.id}-${Date.now()}.${ext}`
- [x] Client: Using authenticated Supabase client (not service role)
- [x] Error handling: Console logging + friendly UI messages
- [x] Error detection: Checks for "bucket" and "not found" keywords

### 🔧 Supabase Configuration Checklist

#### 1. Bucket Creation
- [ ] Go to https://supabase.com → Your Project → Storage
- [ ] Create bucket named exactly: `business-logos`
- [ ] Set to **Public** (for logo visibility)
- [ ] Bucket appears in storage dashboard

#### 2. Row-Level Security (RLS) Policies
- [ ] RLS is **enabled** on the bucket (check in bucket details)
- [ ] Policy 1: Users can upload/read their own folder
  ```
  (bucket_id = 'business-logos' AND (auth.uid())::text = (storage.foldername(name))[1])
  ```
- [ ] Policy 2: Anonymous users can read all files
  ```
  bucket_id = 'business-logos'
  ```

#### 3. Environment Variables
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Both values are correct (copy from Supabase project settings)
- [ ] Dev server restarted after updating `.env.local`

#### 4. Authentication
- [ ] Logged into dashboard (at `/dashboard/settings`)
- [ ] User session is active (not expired)
- [ ] Supabase auth returns valid user ID

### 🧪 Testing Steps

#### Step 1: Check Console Logs
```
1. Open /dashboard/settings
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Try uploading a logo
5. Look for messages starting with:
   - "Logo upload error:" → Shows the real error
   - "Logo uploaded successfully:" → Successful upload
   - "Database update error:" → DB save failed
```

#### Step 2: Verify Bucket Exists
```powershell
# In Supabase Dashboard:
1. Click "Storage" in left sidebar
2. Look for "business-logos" bucket
3. Click it to see contents
```

#### Step 3: Check Upload Path
```
Expected structure in Supabase:
business-logos/
└── {user_id}/ (e.g., 550e8400-e29b-41d4-a716-446655440000)
    └── {business_id}-{timestamp}.png
```

#### Step 4: Verify Database Update
```sql
-- In Supabase SQL Editor, check if logo was saved:
SELECT id, logo_url FROM public.businesses WHERE user_id = 'YOUR_USER_ID';
```

Expected result:
```
id                                  | logo_url
b1234567-e89b-12d3-a456-426614174000| https://xxx.supabase.co/storage/v1/object/public/business-logos/550e8400.../...
```

### 🐛 Common Errors & Solutions

#### Error: "Bucket not found"
**Cause**: `business-logos` bucket doesn't exist in Supabase Storage
**Solution**: Create it following the setup guide in `SUPABASE_BUCKET_SETUP.md`

#### Error: "Not authenticated"
**Cause**: User not logged in or session expired
**Solution**: 
- Log in to dashboard
- Check `/dashboard/settings` redirects to login if not authenticated
- Restart dev server

#### Error: "Permission denied"
**Cause**: RLS policies not configured correctly
**Solution**: 
- Verify RLS policies allow authenticated users
- Check policy expression uses `(auth.uid())::text`
- Make sure policies are **enabled** (not just created)

#### Logo uploads but doesn't show in preview
**Cause**: Public URL not saved to database
**Solution**:
- Check browser console for "Database update error"
- Verify businesses table has logo_url column
- Check user_id and business_id match the constraints

#### Logo preview shows but not on public page
**Cause**: Public page not reading from database
**Solution**:
- Check `/b/[slug]/page.tsx` for logo_url variable
- Verify `biz.logo_url` is being accessed
- Make sure public URL is accessible (test in new browser tab)

### 📝 Build Status
- [x] Build compiles: ✓ Compiled successfully in 43s
- [x] TypeScript check: ✓ Finished in 29.5s
- [x] Settings page route: ✓ /dashboard/settings in routes
- [x] Dev server: ✓ Running at http://localhost:3000

### ✅ Everything Verified
- [x] Bucket name exact: `business-logos`
- [x] Upload path includes user.id: `${userId}/${businessId}-${timestamp}.${ext}`
- [x] Error messages improved with console logging
- [x] Friendly error for "bucket not found" scenario
- [x] Supabase client uses anon key (not service role)
- [x] Build passes with no errors

## Next Steps

1. **Create the bucket** in Supabase (see SUPABASE_BUCKET_SETUP.md)
2. **Configure RLS policies** for upload permissions
3. **Test upload** and check console logs
4. **Verify** logo appears in Supabase Storage
5. **Check database** to confirm logo_url is saved
6. **Test public page** to verify logo displays

Once the bucket exists and RLS is configured, uploads should work! ✅
