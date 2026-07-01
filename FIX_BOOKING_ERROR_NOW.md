# 🚨 URGENT: Database Constraints Required

## The Problem
You're getting: **"there is no unique or exclusion constraint matching the ON CONFLICT specification"**

This is happening in **Supabase Database** - not in the application code.

## Root Cause
Your Supabase database has triggers that use upsert operations, but the tables don't have the required unique constraints.

## What You Must Do

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Click your **Bookorvia** project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query** button

### Step 2: Run This SQL

Copy this entire block and paste it into the SQL editor:

```sql
-- Fix calendar_events constraint
DROP INDEX IF EXISTS public.calendar_events_booking_request_id_idx;

ALTER TABLE public.calendar_events
ADD CONSTRAINT calendar_events_booking_request_id_unique
UNIQUE (booking_request_id);

-- Fix business_calendar_settings constraint
ALTER TABLE public.business_calendar_settings
ADD CONSTRAINT business_calendar_settings_business_id_unique
UNIQUE (business_id);
```

### Step 3: Execute
Click the **Run** button (or press Ctrl+Enter)

### Step 4: Wait for Success
You should see:
```
Query executed successfully
```

**No errors should appear.**

### Step 5: Test Booking
1. Go to http://localhost:3000/b/your-business-slug
2. Select a service
3. Pick a date and time
4. Click "Book Now"
5. ✅ Should work!

## Why This Works

The Supabase database has **database triggers** that automatically:
- Create calendar events when bookings are made
- Update calendar settings when they're saved

These triggers use PostgreSQL's `upsert` feature (INSERT ... ON CONFLICT), which requires unique constraints on the columns being used for conflict detection.

**My fix to the app code handles the application side.**
**Your Supabase SQL fixes handle the database side.**

Together they'll make it work! ✅

## If You Get an Error

If you see an error like "constraint already exists", that means:
- The constraint is already there (good!)
- Try just creating a new booking to see if it works

## Still Having Issues?

Make sure you:
1. ✅ Opened the SQL Editor (not just looking at tables)
2. ✅ Created a NEW Query
3. ✅ Copied the ENTIRE SQL block above
4. ✅ Clicked RUN button
5. ✅ Waited for "Query executed successfully"
6. ✅ Restarted the dev server (`npm run dev`)
7. ✅ Cleared browser cache (Ctrl+Shift+Delete)
8. ✅ Tested again

## Time to Fix: ~2 minutes

That's it! The SQL is just adding missing database constraints. Quick and safe.
