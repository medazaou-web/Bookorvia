# Fix: Service Role Key Not Being Read

## Problem
```
Server error: [SUPABASE ADMIN] Missing SUPABASE_SERVICE_ROLE_KEY environment variable
```

**Cause**: The development server is still using old environment variables from before the `.env.local` file was updated.

## Solution: Restart the Dev Server

### Step 1: Stop the Dev Server
If `npm run dev` is currently running:
1. Go to the terminal where it's running
2. Press `Ctrl+C` to stop it
3. Wait for it to fully stop

### Step 2: Restart Dev Server
```bash
npm run dev
```

The server will restart and reload all environment variables from `.env.local`.

### Step 3: Test the API
Once the server restarts, visit:
```
/api/public/availability?slug=YOUR_BUSINESS_SLUG&serviceId=YOUR_SERVICE_ID&date=2026-06-29&debug=1
```

You should now see:
```json
{
  "slots": [...],
  "debug": {
    "businessFound": true,
    "serviceFound": true,
    "workingHoursFound": 1,
    ...
  }
}
```

No more "Missing SUPABASE_SERVICE_ROLE_KEY" error.

## Why This Happens

Next.js loads environment variables when the dev server starts. If you:
1. Add a variable to `.env.local`
2. But don't restart the dev server
3. The old environment is still in memory

The server doesn't automatically reload `.env.local` - you must restart it.

## Verification

After restarting, you should see in terminal output:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

Then the API call should work.

## If It Still Doesn't Work

1. **Double-check `.env.local`**:
   - Verify line contains: `SUPABASE_SERVICE_ROLE_KEY=eyJ...`
   - Check no typos in variable name
   - Verify key starts with `eyJ` (standard JWT format)

2. **Check terminal for build errors**:
   - Look for any TypeScript or build errors when server starts
   - Fix any errors that appear

3. **Check console logs**:
   - Open browser Developer Tools (F12)
   - Go to Console tab
   - Look for any JavaScript errors
   - Check Network tab for the API response

4. **Try the debug URL again**:
   ```
   /api/public/availability?slug=YOUR_SLUG&serviceId=YOUR_SERVICE_ID&date=2026-06-29&debug=1
   ```

## Summary

**The key is already in `.env.local`.** Just restart the dev server!

```bash
# 1. Stop current server (Ctrl+C)
# 2. Run:
npm run dev
# 3. Wait for "ready - started server" message
# 4. Test the API
```

That's it! The availability API will now work.
