# ⚠️ SUPABASE DATABASE FIXES REQUIRED

## The Real Issue

The "Book Now" button error is NOT in the application code - it's in your **Supabase database** itself.

When a booking is created, Supabase has a **trigger or function** that automatically creates a calendar event. That trigger is using upsert without proper constraints.

## What Needs to Be Fixed

In your **Supabase Database**, there's likely:
1. A trigger on `booking_requests` table
2. Or a database function that runs on booking creation
3. That tries to upsert into `calendar_events` table
4. Using `booking_request_id` as the unique identifier

## The SQL Fixes

Run **BOTH** of these in your Supabase SQL Editor:

### Fix 1: Add Unique Constraint to calendar_events

```sql
-- First, drop the partial unique index if it exists
DROP INDEX IF EXISTS public.calendar_events_booking_request_id_idx;

-- Then add a real unique constraint
ALTER TABLE public.calendar_events
ADD CONSTRAINT calendar_events_booking_request_id_unique
UNIQUE (booking_request_id);
```

### Fix 2: Verify business_calendar_settings Constraint

```sql
-- Make sure the calendar settings constraint exists
ALTER TABLE public.business_calendar_settings
ADD CONSTRAINT business_calendar_settings_business_id_unique
UNIQUE (business_id);
```

## Steps to Apply

1. Go to https://app.supabase.com
2. Select your **Bookorvia** project
3. Click **SQL Editor** → **New Query**
4. Copy and paste **Fix 1** above
5. Click **Run**
6. Create another new query and paste **Fix 2**
7. Click **Run**

## After Running SQL

Test the booking again:
1. Go to `/b/your-business-slug`
2. Select service, date, time
3. Click "Book Now"
4. ✅ Should work without constraint errors

## Why This Fixes It

**Before:**
- Booking created → Trigger tries to upsert calendar event
- No unique constraint on booking_request_id
- PostgreSQL error: "no unique constraint matching ON CONFLICT"

**After:**
- Booking created → Trigger finds calendar event or creates new one
- Unique constraint on booking_request_id allows upsert to work
- Booking process completes successfully

## Important Note

**You must apply these SQL changes in Supabase** - I cannot do it from my side because:
- These are database schema changes
- Only Supabase database connections can execute this
- It's in your project's database, not in the application code

## Verification

After running the SQL, you can verify with:

```sql
-- Check calendar_events constraints
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE table_name IN ('calendar_events', 'business_calendar_settings')
ORDER BY table_name, constraint_name;
```

Expected result should show:
- `calendar_events_booking_request_id_unique` on calendar_events
- `business_calendar_settings_business_id_unique` on business_calendar_settings

## Summary

| Issue | Location | Fix |
|-------|----------|-----|
| Booking fails with constraint error | Supabase database | Add unique(booking_request_id) to calendar_events |
| Settings save fails | Supabase database | Add unique(business_id) to business_calendar_settings |
| Code error | app/dashboard/calendar/page.tsx | ✅ Already fixed (delete + insert) |

The code fix I applied helps with settings, but the **database constraints** are also required for bookings to work.
