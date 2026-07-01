# PostgreSQL Constraint Fix - Action Checklist

## 🔴 The Problem
```
Error: there is no unique or exclusion constraint matching the ON CONFLICT specification
Location: app/dashboard/calendar/page.tsx line 732
Table: business_calendar_settings
Operation: .upsert() on business_id
```

## 🟢 The Solution

### Step 1: Add Database Constraint

**In Supabase Dashboard:**
1. Go to SQL Editor
2. New Query
3. Copy-paste this SQL:

```sql
ALTER TABLE public.business_calendar_settings
ADD CONSTRAINT business_calendar_settings_business_id_unique
UNIQUE (business_id);
```

4. Click Run
5. ✅ Done! (no code changes needed)

### Step 2: Test the Fix

#### Test A: Save Calendar Settings
- [ ] Go to http://localhost:3000/dashboard/calendar
- [ ] Click ⚙️ Settings tab
- [ ] Change timezone or another setting
- [ ] Click "Save Settings"
- [ ] Verify: "✓ Settings saved successfully" message appears
- [ ] Refresh page
- [ ] Verify: Settings are still saved

#### Test B: Build
- [ ] Run: `npm run build`
- [ ] Verify: Build completes successfully
- [ ] Verify: No "constraint matching ON CONFLICT" errors
- [ ] Verify: No TypeScript errors

#### Test C: Full Application
- [ ] Log in to dashboard
- [ ] Navigate to `/dashboard/calendar`
- [ ] All tabs work: Calendar, Hours, Settings
- [ ] Add a manual calendar event
- [ ] Verify: No console errors

#### Test D: Public Booking
- [ ] Navigate to `/b/your-business-slug`
- [ ] Select a service
- [ ] Pick a date
- [ ] Select a time slot
- [ ] Submit booking
- [ ] Verify: Success or pending confirmation message

### Step 3: Verify Database Change

**In Supabase Dashboard > SQL Editor:**

Run this query to verify the constraint exists:

```sql
SELECT constraint_name, table_name, column_name
FROM information_schema.constraint_column_usage
WHERE table_name = 'business_calendar_settings'
ORDER BY constraint_name;
```

**Expected Result:**
```
business_calendar_settings_business_id_unique | business_calendar_settings | business_id
business_calendar_settings_pkey             | business_calendar_settings | id
```

## 📋 Checklist

### Before Fix
- [ ] Error occurs when saving calendar settings
- [ ] Build may fail with constraint errors
- [ ] upsert operation on line 732 fails

### After Fix Applied
- [ ] SQL ALTER TABLE executed successfully
- [ ] No constraint errors in browser console
- [ ] Calendar settings save works ✓
- [ ] Build completes successfully ✓
- [ ] Public booking page works ✓

### Full Test Suite
- [ ] Dashboard loads without errors
- [ ] Calendar tab works
- [ ] Settings tab: can save settings
- [ ] Hours tab: can save working hours
- [ ] Manual event creation works
- [ ] Public booking form works
- [ ] npm run build passes

## 🎯 Why This Fix

**Problem:** Upsert without unique constraint
- PostgreSQL doesn't know which row to update
- Fails with "no unique constraint matching"

**Solution:** Add unique constraint on business_id
- PostgreSQL knows: "One settings row per business"
- Upsert now knows exactly which row to update
- First upsert: Insert
- Later upserts: Update existing row

**Result:** Perfect upsert behavior ✅

## 📊 Scope Analysis

| Component | Status |
|-----------|--------|
| upsert on business_calendar_settings | ❌ BROKEN → ✅ FIXED |
| Business working hours save | ✅ WORKS - uses delete+insert |
| Manual calendar events | ✅ WORKS - uses simple insert |
| Public booking creation | ✅ WORKS - uses simple insert |
| Calendar settings display | ⚠️ DEPENDS ON FIX |
| Dashboard calendar view | ⚠️ DEPENDS ON FIX |

## 🚀 Post-Fix Deployment

After confirming all tests pass:

1. [ ] Commit any documentation changes
2. [ ] Deploy to production
3. [ ] Monitor error logs
4. [ ] Verify calendar settings work in production

## ⚡ Quick Reference

**SQL to Add Constraint:**
```sql
ALTER TABLE public.business_calendar_settings
ADD CONSTRAINT business_calendar_settings_business_id_unique
UNIQUE (business_id);
```

**SQL to Remove Constraint (if needed):**
```sql
ALTER TABLE public.business_calendar_settings
DROP CONSTRAINT business_calendar_settings_business_id_unique;
```

**SQL to Verify Constraint:**
```sql
SELECT * FROM pg_constraints
WHERE table_name = 'business_calendar_settings';
```

## ❓ FAQ

**Q: Do I need to change any code?**
A: No! The code is correct. Only the database needs the constraint.

**Q: Will this delete existing data?**
A: No. It only adds a constraint going forward.

**Q: Can there be multiple settings per business now?**
A: No, the constraint prevents it. One settings row per business only. ✅

**Q: How long does the SQL take?**
A: Instant (< 1 second) for a small table.

**Q: Is this required for production?**
A: Yes! The app can't save settings without it.

## 📞 Support

If the constraint won't add:
1. Check: Does `business_calendar_settings` table exist?
2. Check: Are all records unique by business_id? (no duplicates)
3. If duplicates exist, delete them first, then add constraint

---

**Status: ✅ READY TO APPLY**

The fix is simple, safe, and required for the app to function properly.
