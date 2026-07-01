# .env.local Setup Guide for Bookorvia

## Location
The `.env.local` file must be at the project root, same level as `package.json`:

```
clientloop/
├── package.json
├── .env.local          ← Here
├── app/
├── lib/
└── ...
```

## Format
**Exact format required:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://snsjwsddirqfmldlmplq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ChyrHF4FuTd7ru87PBHc-w_WaSruGvu
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ChyrHF4FuTd7ru87PBHc-w_WaSruGvu
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuc2p3c2RkaXJxZm1sZGxtcGxxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjA3NDY1OSwiZXhwIjoyMDk3NjUwNjU5fQ.o5tGrG_NDvCoJ6wlKOfhdYr5egQxsswh8uiw0FXvo_M
```

## Key Rules

### ✅ Correct Format
- No spaces around `=`
- No quotes around values
- `SUPABASE_SERVICE_ROLE_KEY` (without `NEXT_PUBLIC_` prefix)
- One line per variable
- Each key starts with correct variable name

### ❌ Wrong Format
```bash
SUPABASE_SERVICE_ROLE_KEY = eyJ...          # WRONG: spaces around =
SUPABASE_SERVICE_ROLE_KEY="eyJ..."          # WRONG: quotes
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJ...  # WRONG: NEXT_PUBLIC prefix (exposes to browser)
SERVICE_ROLE_KEY=eyJ...                     # WRONG: wrong variable name
```

## Step-by-Step Setup

### Step 1: Get Your Keys from Supabase
1. Go to your Supabase project dashboard
2. Click **Settings** → **API**
3. You'll see:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** secret → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Create `.env.local`
In the project root directory:

```bash
touch .env.local
```

### Step 3: Add Your Keys
Edit `.env.local` and paste:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Replace:
- `YOUR_PROJECT_ID` with your Supabase project ID
- `YOUR_ANON_KEY` with your public/anon key
- `YOUR_SERVICE_ROLE_KEY` with your service role secret

### Step 4: Restart Dev Server
```bash
# If currently running:
Ctrl + C

# Then start:
npm run dev
```

Wait for:
```
✓ Ready in XXXms
```

### Step 5: Test
In browser, open:
```
/api/public/availability?slug=test&serviceId=test&date=2026-06-29&debug=1
```

Check terminal for:
```
[AVAILABILITY] SERVICE ROLE LOADED: true
```

If it says `true`, the environment is loaded correctly!

## Verification

### Check 1: File Exists
```bash
# In project root:
ls -la .env.local
```

Should show the file exists.

### Check 2: File Format
```bash
# Check for correct format:
cat .env.local
```

Should show:
```
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Check 3: Dev Server Restarted
After running `npm run dev`, should see:
```
event - compiled successfully
✓ Ready in XXXms
```

Not just the old logs from before.

### Check 4: Service Role Loaded
After making a request to availability API, terminal should show:
```
[AVAILABILITY] SERVICE ROLE LOADED: true
```

If it says `false`, environment not loaded. Restart dev server again.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| "Missing SUPABASE_SERVICE_ROLE_KEY" | Env var not set | Check .env.local exists and has the key |
| SERVICE ROLE LOADED: false | Dev server not restarted | Ctrl+C then `npm run dev` |
| Service role key exposed to browser | Used NEXT_PUBLIC_ prefix | Change to `SUPABASE_SERVICE_ROLE_KEY=` (no prefix) |
| API still returns error | Old .env.local format | Check no spaces around `=`, no quotes |
| Cannot find .env.local | File in wrong location | Put `.env.local` at project root (same level as package.json) |

## Security Notes

- ✅ Service role key stays on server (no `NEXT_PUBLIC_` prefix)
- ✅ Only used in API routes, never in client components
- ✅ Never commit `.env.local` to git (already in .gitignore)
- ✅ Key should only be visible to authorized developers
- ✅ Public/anon key can be public (has `NEXT_PUBLIC_` prefix)

## After Setup

Once `.env.local` is properly configured and dev server restarted:

1. **Availability API will work**: `/api/public/availability?...` returns slots
2. **Public booking will show times**: `/b/slug` displays available times
3. **Dashboard still works**: `/dashboard/calendar` unchanged
4. **Auth unchanged**: Login/signup unaffected

You're done! The public availability system is now fully functional.
