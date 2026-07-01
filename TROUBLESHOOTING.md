# Bookorvia - Complete Troubleshooting Guide

## Issue: Service Role Key Error

### Error Message
```
{"slots":[],"debug":{"reason":"Server error: [SUPABASE ADMIN] Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Check server logs for details."},"error":"Internal server error"}
```

## Root Cause
Environment variables are loaded when the dev server starts. Changes to `.env.local` require a server restart.

## Solution (Quick Fix)

### Step 1: Stop the Dev Server
```bash
# In your terminal, press:
Ctrl + C
```

Wait until you see:
```
(To exit press Ctrl+C again)
```

### Step 2: Start the Dev Server Again
```bash
npm run dev
```

Wait for the output:
```
✓ Ready in XXXX ms
  ➜ Local:   http://localhost:3000
  ➜ Folders: .next
```

### Step 3: Test Again
Open in browser:
```
http://localhost:3000/api/public/availability?slug=YOUR_SLUG&serviceId=YOUR_SERVICE_ID&date=2026-06-29&debug=1
```

You should now see slots and no error!

---

## Detailed Verification

If the quick fix doesn't work, follow these steps:

### Check 1: Verify `.env.local` Has the Key

**File**: `.env.local`

Should contain:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://snsjwsddirqfmldlmplq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important**:
- ✅ Key name is: `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix)
- ✅ Value starts with: `eyJ...` (JWT format)
- ✅ No quotes around the key value
- ✅ No extra spaces

### Check 2: Verify Dev Server Restarted

Look for these lines in terminal after restart:
```
event - compiled successfully
✓ Ready in XXXms
```

If you see old logs about missing environment, the server didn't fully restart.

### Check 3: Test Public Booking Page

After restart, test public page:

1. Navigate to: `http://localhost:3000/b/YOUR_BUSINESS_SLUG`
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Select a service
5. Pick a date
6. Check console for logs:
   ```
   Selected service ID: service-uuid
   Fetching availability from: /api/public/availability?slug=...&serviceId=...&date=...
   Availability response: { slots: [...] }
   Found slots: 17
   ```

If you see "Found slots: X", it's working!

### Check 4: Check Server Console

In the terminal running `npm run dev`, look for:

**Success** (no error):
```
[AVAILABILITY] Request: slug=..., serviceId=..., date=..., debug=1
[AVAILABILITY] Business found: business-id
[AVAILABILITY] Service found: Service Name, 60 min duration
[AVAILABILITY] Settings: timezone=..., interval=30min, buffer=0min, notice=0h, max_days=30
[AVAILABILITY] Found 1 working hour(s) for day 1
[AVAILABILITY] Total: 17 generated, 0 blocked, 17 available
```

**Error** (environment not reloaded):
```
[AVAILABILITY] Error: [SUPABASE ADMIN] Missing SUPABASE_SERVICE_ROLE_KEY...
```

---

## Common Issues and Fixes

| Issue | Sign | Fix |
|-------|------|-----|
| Environment not reloaded | Error still shows after restart | Try stopping/starting again, wait for "Ready" message |
| Wrong service role key | JWT decode error | Copy/paste key from Supabase Project Settings → API |
| Key has quotes | Still missing error | Remove quotes: `SUPABASE_SERVICE_ROLE_KEY=eyJ...` not `SUPABASE_SERVICE_ROLE_KEY="eyJ..."` |
| Multiple envs loaded | Wrong service role | Only `.env.local` should have the key, not `.env` or `.env.production` |
| No available slots | But debug shows workingHoursFound: 0 | Set working hours in dashboard for that day |
| Slots are generated | But public page shows "No times" | Reload browser (Ctrl+F5) or check browser console |

---

## Testing Workflow

### 1. Setup Test Data
- Business: slug = `test-business`
- Service: name = `Haircut`, duration = 60 min
- Working hours: Monday 09:00–18:00, `is_enabled = true`

### 2. Test API with Debug
```
/api/public/availability?slug=test-business&serviceId=SERVICE_ID&date=2026-06-29&debug=1
```

Expected response:
```json
{
  "slots": [
    {"label": "09:00", "starts_at": "...", "ends_at": "..."},
    {"label": "09:30", ...},
    ...
  ],
  "debug": {
    "businessFound": true,
    "serviceFound": true,
    "workingHoursFound": 1,
    "workingHours": [...],
    "slotsBeforeBlocking": [...],
    "slotsAfterBlocking": [...]
  }
}
```

### 3. Test Public Page
- Go to `/b/test-business`
- Select "Haircut"
- Pick Monday (2026-06-29)
- Should see time slots

### 4. Test with Event
- In dashboard, add event Monday 13:00–14:00
- Go back to public page
- Reload and pick Monday
- Only 13:00 and 13:30 should be missing

---

## If Nothing Works

### Nuclear Option: Clear Next.js Cache
```bash
# Stop dev server (Ctrl+C)
# Then:
rm -r .next
npm run dev
```

### Check Build for Errors
```bash
npm run build
```

Look for TypeScript errors.

### Verify Supabase Connection
In browser console, run:
```javascript
fetch('/api/public/availability?slug=test&serviceId=test&date=2026-06-29&debug=1')
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
```

This shows the exact error from the server.

---

## Summary

**The service role key is in `.env.local`.**

Just restart the dev server:
```bash
# Press Ctrl+C to stop
# Then:
npm run dev
```

That's it! The availability API will work.

If you see "Ready in XXms", the server is ready and environment variables are loaded. Try the API again.
