# PostgreSQL Constraint Fixes for Bookorvia

## Problem
The application is using upsert (ON CONFLICT) on tables without unique constraints:
- `business_calendar_settings` table: trying to upsert on `business_id` without unique constraint

## Error
```
there is no unique or exclusion constraint matching the ON CONFLICT specification
```

## Root Cause
The upsert operation at `app/dashboard/calendar/page.tsx:732` is trying to use:
```typescript
.upsert({
  business_id: businessId,
  ...settings,
})
.eq('business_id', businessId)
```

But the `business_calendar_settings` table doesn't have a unique constraint on `business_id`.

## Solution

### For Supabase Dashboard:

Run this SQL in the Supabase SQL Editor:

```sql
-- Add unique constraint to business_calendar_settings
-- This ensures one settings row per business
ALTER TABLE public.business_calendar_settings
ADD CONSTRAINT business_calendar_settings_business_id_unique
UNIQUE (business_id);
```

### Why This Fix Works:
- Each business should have exactly ONE settings row
- The upsert operation will then work correctly:
  - First insert: creates new settings row
  - Subsequent updates: finds existing row via unique constraint and updates it
  - No duplicate rows per business

## Verification

After running the SQL:

1. **Test in Dashboard:**
   - Go to `/dashboard/calendar`
   - Click "⚙️ Settings" tab
   - Change a setting (e.g., timezone)
   - Click "Save Settings"
   - Should see: "✓ Settings saved successfully"

2. **Test in Build:**
   ```bash
   npm run build
   ```
   Should complete without errors

3. **Test Public Booking:**
   - Navigate to `/b/your-business`
   - Select a service and date
   - Submit booking
   - Should successfully create booking_request

## Files Affected

**File:** `app/dashboard/calendar/page.tsx`
- Line 732-737: Uses `.upsert()` on `business_calendar_settings`
- This is the only upsert in the application

**No Code Changes Needed:**
- The code is correct and idiomatic
- Once the constraint exists, the upsert will work properly
- No refactoring required

## Testing Checklist

After applying the constraint:

- [ ] Save calendar settings (all fields)
- [ ] Change and re-save settings
- [ ] Add manual calendar event
- [ ] Create public booking (if RLS allows)
- [ ] npm run build passes
- [ ] No TypeScript errors
- [ ] No 401/403 errors in console

## Related Tables

For reference, these tables are used but don't have issues:

- `business_working_hours`: Uses delete + insert pattern (no upsert)
- `calendar_events`: Uses simple insert
- `booking_requests`: Uses simple insert
- `businesses`: Primary table, has proper constraints
