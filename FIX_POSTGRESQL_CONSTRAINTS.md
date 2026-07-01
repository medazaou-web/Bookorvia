# 🔧 Fix PostgreSQL Constraint Errors

## Problem Summary

The app is using `.upsert()` on the `business_calendar_settings` table without a unique constraint, causing:

```
Error: there is no unique or exclusion constraint matching the ON CONFLICT specification
```

## Root Cause

**File:** `app/dashboard/calendar/page.tsx` at line 732-737

```typescript
const { error } = await supabase
  .from('business_calendar_settings')
  .upsert({
    business_id: businessId,
    ...settings,
  })
  .eq('business_id', businessId);
```

The upsert operation requires a unique constraint on the columns it's using to identify conflicts. Currently, there's no `UNIQUE (business_id)` constraint on `business_calendar_settings`.

## Solution

### Step 1: Open Supabase SQL Editor

1. Go to https://app.supabase.com
2. Select your project: **Bookorvia** or your project name
3. Click **SQL Editor** in the sidebar
4. Click **New Query**

### Step 2: Run This SQL

Copy and paste into the SQL editor:

```sql
-- Add unique constraint to business_calendar_settings table
-- This allows the upsert operation to work correctly
ALTER TABLE public.business_calendar_settings
ADD CONSTRAINT business_calendar_settings_business_id_unique
UNIQUE (business_id);
```

Then click **Run** (or Ctrl+Enter)

### Step 3: Verify

The query should complete without errors. You'll see a message like:
```
ALTER TABLE completed successfully
```

## Testing After Fix

### Test 1: Calendar Settings Save

1. Go to http://localhost:3000/dashboard/calendar
2. Click the **⚙️ Settings** tab
3. Change a setting (e.g., timezone dropdown)
4. Click **Save Settings** button
5. **Expected:** Message shows "✓ Settings saved successfully"

### Test 2: Verify Persistence

1. Still on Settings tab
2. Close and reopen the page (or refresh)
3. **Expected:** Your setting change is still there

### Test 3: Build Check

Run:
```bash
npm run build
```

**Expected:** Build completes successfully (you may see warnings about middleware, but no build errors)

## What This Constraint Does

- **Before:** Table could have multiple settings rows for the same business
- **After:** Table can only have ONE settings row per business
- **Result:** Upsert now works correctly:
  - First time: Insert creates new row
  - Subsequent times: Update finds the existing row and updates it

## Why No Code Changes Needed

The code is already correct! It's using `.upsert()` properly:
- It's trying to upsert with `business_id` as the key
- It's using `.eq('business_id', businessId)` for the match condition
- The logic is sound

The only issue was that the database constraint was missing.

## Related Code

**Calendar Settings Save Function:**
```typescript
// Line 724-742 in app/dashboard/calendar/page.tsx
async function saveSettings() {
  if (!businessId || !settings) return;

  setSaving(true);
  setMessage(null);

  try {
    const { error } = await supabase
      .from('business_calendar_settings')
      .upsert({
        business_id: businessId,
        ...settings,
      })
      .eq('business_id', businessId);

    if (error) throw error;

    setMessage({ type: 'success', text: '✓ Settings saved successfully' });
  } catch (err: any) {
    console.error('Error saving settings:', err);
    setMessage({
      type: 'error',
      text: err?.message || 'Failed to save settings. Please try again.',
    });
  } finally {
    setSaving(false);
  }
}
```

## FAQ

**Q: Will this affect existing data?**
A: No. If you already have settings, the constraint just enforces that one row per business going forward.

**Q: Can I have multiple settings rows per business?**
A: No, and that's correct. Each business should have one settings configuration (timezone, slot interval, etc.).

**Q: What if I try to add a second settings row for the same business?**
A: The database will reject it with a unique constraint violation error. This is the desired behavior.

**Q: Can I undo this change?**
A: Yes, you can drop the constraint:
```sql
ALTER TABLE public.business_calendar_settings
DROP CONSTRAINT business_calendar_settings_business_id_unique;
```
But don't do this unless you have a good reason.

## Summary

| Item | Before | After |
|------|--------|-------|
| Upsert on `business_calendar_settings` | ❌ Fails with constraint error | ✅ Works correctly |
| Multiple settings per business | ⚠️ Technically possible | ❌ Database enforces limit of 1 |
| Calendar Settings tab | ❌ Cannot save | ✅ Can save successfully |
| Build | ❌ May have runtime errors | ✅ Builds successfully |
| Code changes needed | — | ✅ None! |

The fix is purely database-side. No application code changes required.
