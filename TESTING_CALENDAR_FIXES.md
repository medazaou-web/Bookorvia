# Calendar & Availability Testing Checklist

## Summary of Changes

### PART 1: Fixed Public Booking Availability
**File**: `app/api/public/availability/route.ts`

✅ **Fixed Issues:**
1. Added `is_enabled = true` filter to working hours query
2. Fixed event overlap detection - now checks both `starts_at` and `ends_at` times properly
3. Added comprehensive debug logging for troubleshooting:
   - Business ID
   - Service duration
   - Calendar settings (timezone, slot interval, buffer, notice, max days)
   - Day of week
   - Date range validation
   - Working hours found
   - Events found
   - Slot generation stats (total generated, blocked, available)

4. Event query now catches events spanning day boundaries:
   - Before: Only checked if `starts_at` was within day
   - After: Checks if `ends_at >= dayStart AND starts_at <= dayEnd` (proper overlap)

**Why This Matters:**
- Availability was showing "no slots" even when working hours existed
- Root causes: missing `is_enabled` filter, incorrect event overlap logic
- Debug logging helps identify exactly where slots are being blocked

### PART 2: Made Calendar Slots Clickable
**File**: `app/dashboard/calendar/page.tsx`

✅ **New Features:**
1. **Time-based Week Grid** (9 AM - 6 PM)
   - Replaced simple day cards with professional hourly grid
   - 7 columns (days) × 10 rows (hours)
   - Current day highlighted in indigo
   - Time labels on left

2. **Clickable Slots**
   - Click any empty time slot to add event
   - Slots show hover effect (light indigo)
   - Click handlers call `handleSlotClick(date, hour, minute)`

3. **QuickAddModal Component**
   - Opens when slot clicked
   - Prefilled with:
     - Selected date
     - Selected hour/time
     - End time: 30 minutes after start (default)
   - Full form with title, type, dates, times, notes
   - Saves to `calendar_events` with `status: 'busy'`
   - Event appears in calendar immediately after save

4. **Event Display in Grid**
   - Events colored by source (booking, external, break, unavailable)
   - Event titles shown in correct time slot
   - Hover tooltip shows full time range
   - Existing events don't prevent slot clicks (you can see occupied slots)

---

## Testing Checklist

### Test 1: Setup Working Hours & Settings

**Setup:**
1. Go to `/dashboard/calendar`
2. Click "⏰ Hours" tab
3. Enable Monday-Friday with hours 9:00 AM - 5:00 PM
4. Click "Save Working Hours"

**Expected Result:**
- ✅ Message: "✓ Working hours saved successfully"
- ✅ Hours appear as saved after refresh
- ✅ Calendar shows time slots for enabled days only

**Debug If Fails:**
- Check browser console for errors
- Check Supabase RLS policies allow insert/update to `business_working_hours`
- Verify business is correctly authenticated

---

### Test 2: Add Manual Block to Calendar via Click

**Setup:**
1. Ensure "⏰ Hours" tab is saved (Test 1 completed)
2. Click back to "📅 Calendar" tab
3. In the calendar grid, click on **Monday 2:00 PM** (2 PM hour slot)

**Expected Result:**
- ✅ Modal opens titled "Add Event"
- ✅ Modal shows:
  - Title field (empty, focused)
  - Type: "Manual Reservation" (dropdown selected)
  - Start Date: Today's Monday date
  - Start Time: "14:00" (2 PM)
  - End Date: Today's Monday date  
  - End Time: "14:30" (2:30 PM - 30 min default)
  - Notes: (empty textarea)

**Next Action:**
- Fill Title: "Team Meeting"
- Keep Type: "Manual Reservation"
- Click "✓ Add"

**Expected Result:**
- ✅ Modal closes
- ✅ Success message briefly shown
- ✅ Calendar refreshes
- ✅ "Team Meeting" appears in 2:00 PM slot (Monday)
- ✅ Block is colored (blue for manual reservation)

**Debug If Fails:**
- Modal doesn't open:
  - Check browser console for JavaScript errors
  - Verify `handleSlotClick` function is called
  - Check modal CSS not hidden off-screen

- Event doesn't save:
  - Check browser console for fetch errors
  - Verify `calendar_events` table has proper RLS
  - Check `status: 'busy'` is being sent (not 'active')

- Event doesn't appear:
  - Manually refresh calendar
  - Check Supabase Data Editor for the event row
  - Verify `starts_at` and `ends_at` are ISO format

---

### Test 3: Test Calendar Visual Layout

**Action:**
1. Click "📅 Calendar" tab
2. Look at the week grid

**Expected Visual:**
- ✅ Day headers (Sun, Mon, Tue, etc.) with dates
- ✅ Time row labels (9:00 AM, 10:00 AM, etc.)
- ✅ 7 columns for days of week
- ✅ 10 rows for hourly slots
- ✅ Each cell is clickable
- ✅ Hover on empty slot → slight indigo highlight
- ✅ Existing events show as colored blocks with titles

**Mobile Test:**
- ✅ Grid scrolls horizontally on small screens (if needed)
- ✅ Time labels stay visible
- ✅ Slots are still clickable on mobile

**Debug If Fails:**
- Grid looks squished:
  - Check grid CSS in calendar section (should use `grid-template-columns`)
  - Verify grid has proper gap and padding

- Slots not clickable:
  - Check `onClick={handleSlotClick}` present on slot div
  - Verify click handler not prevented by overlaid elements
  - Check z-index layering if modal opens

---

### Test 4: Test Public Booking Availability (Most Important)

**Setup:**
1. Create a business (or use existing one) with slug: `test-business`
2. Create a service with `duration_minutes: 30` and `is_active: true`
3. Go to `/dashboard/calendar`
4. Set working hours: Monday-Friday 9 AM - 5 PM
5. Save settings

**Action:**
1. Open browser **Developer Console** (F12)
2. Go to public booking page: `/b/test-business`
3. Select service
4. Select **next Monday** (or any enabled day with working hours)
5. Watch console while slots load

**Expected Console Output** (check for these logs):
```
[AVAILABILITY] Request: slug=test-business, serviceId=..., date=2026-01-XX
[AVAILABILITY] Business found: business-id-uuid
[AVAILABILITY] Service found: 30 min duration
[AVAILABILITY] Settings: timezone=Africa/Casablanca, interval=30min, buffer=0min, notice=2h, max_days=30
[AVAILABILITY] Requested date: 2026-01-XX, day of week: 1 (0=Sunday, 6=Saturday)
[AVAILABILITY] Date range check: today=..., maxDate=..., requestedDate=...
[AVAILABILITY] Found 0 working hour(s) for day 1
[AVAILABILITY] Found 0 event(s) on 2026-01-XX
[AVAILABILITY] Generated 18 slots, 0 blocked by events, 18 available
```

**Expected UI Result:**
- ✅ "Available Times" section shows **9:00 AM, 9:30 AM, 10:00 AM**, etc.
- ✅ At least 9-10 time slots listed
- ✅ Times are in 30-minute intervals (slot_interval_minutes)
- ✅ No generic "no available" message

**If No Slots Show:**
Check console output to identify exact failure point:

1. **"0 working hour(s) found"** → Working hours not saved or `is_enabled` is false
   - Go to `/dashboard/calendar` → "⏰ Hours" tab
   - Verify days are checked and times are set
   - Click "Save Working Hours"

2. **"Date out of range"** → Date is before today or beyond max_booking_days_ahead
   - Select a different date (not too far in future)
   - Check calendar settings for `max_booking_days_ahead`

3. **"0 slots generated"** → Working hours exist but no slots fit service duration
   - Check service duration is set
   - Make sure start time < end time by at least 30 minutes

4. **"All slots blocked"** → Manual blocks or events are overlapping
   - Check "📅 Calendar" tab - are there events blocking all times?
   - Remove blocking events
   - Try again

**Debug Tips:**
- Open `/api/public/availability?slug=test-business&serviceId=SERVICE_ID&date=2026-01-20`
- API directly returns slots or error
- Check network tab for response payload
- Verify `availableSlots` array contains time objects

---

### Test 5: Block Time and Verify Slots Blocked

**Setup:**
1. From Test 4, working hours are set Monday-Friday 9-5
2. Public booking shows 9-10 time slots for Monday

**Action 1: Add Manual Block**
1. Go to `/dashboard/calendar`
2. Click Monday 9:00 AM slot
3. Modal opens, fill:
   - Title: "Unavailable"
   - Type: "Unavailable"
   - Dates/Times: 9:00 AM - 11:00 AM (covers 9:00 and 9:30 slots)
4. Click "✓ Add"

**Expected Result:**
- ✅ Event appears in calendar 9:00 slot
- ✅ Red block showing "Unavailable"

**Action 2: Check Public Booking**
1. Go back to `/b/test-business`
2. Select same date (Monday)
3. Watch console

**Expected Result:**
- ✅ Console shows: `[AVAILABILITY] Found 1 event(s)`
- ✅ Console shows: `[AVAILABILITY] Generated 18 slots, 2 blocked by events, 16 available`
- ✅ Available times now show: **11:00 AM, 11:30 AM, 12:00 PM**, etc.
- ✅ 9:00 AM and 9:30 AM are **not** in the list
- ✅ 16 slots available instead of 18

**If Slots Still Show 9:00 AM:**
- Event might not be saved properly
- Check calendar events in Supabase Data Editor
- Verify `starts_at` and `ends_at` are correct ISO format
- Verify `status` is `'busy'` (not other values)
- Try different block times (e.g., 10:00-12:00)

---

### Test 6: Click Different Time Slots

**Action:**
1. Calendar tab, click different slots:
   - Tuesday 11:00 AM
   - Wednesday 3:00 PM
   - Thursday 4:30 PM (near end of day)

**Expected Each Time:**
- ✅ Modal opens with correct date
- ✅ Modal shows correct time (within 5 minutes)
- ✅ End time is 30 minutes later

**Examples:**
- Click Tuesday 11:00 → Start: 11:00, End: 11:30
- Click Wednesday 3:00 PM → Start: 15:00, End: 15:30
- Click Thursday 4:30 → Start: 16:30, End: 17:00

**If Any Fail:**
- Slot click might not be registering
- Check `handleSlotClick` gets called with correct parameters
- Verify `initialDate` and `initialTime` passed to modal
- Check modal receives state correctly

---

### Test 7: Test Notice Hours Blocking

**Setup:**
1. Go to `/dashboard/calendar` → "⚙️ Settings" tab
2. Set "Minimum Notice (hours)" to **24** (instead of 2)
3. Click "✓ Save Settings"

**Action:**
1. Go to public booking page `/b/test-business`
2. Select **today** (not a future date)
3. Check console

**Expected Result:**
- ✅ Console shows `[AVAILABILITY] Date range check: today=...`
- ✅ If current time + 24 hours is before end of today, slots should be blocked
- ✅ If it's past 24-hour notice threshold:
  - **No slots** should appear
  - Message: "No available times on this date"
- ✅ If it's early morning and 24 hours doesn't pass end of day:
  - Slots might appear starting later (e.g., after 3 PM if it's 3 AM)

**Reset for Later Tests:**
- Set "Minimum Notice" back to **2 hours** in Settings tab

---

### Test 8: Test Max Booking Days Ahead

**Setup:**
1. Go to `/dashboard/calendar` → "⚙️ Settings" tab
2. Set "Max booking days ahead" to **5** (instead of 30)
3. Save Settings

**Action:**
1. Go to public booking page `/b/test-business`
2. Try to select a date **10 days from now**

**Expected Result:**
- ✅ Date picker shows future dates are selectable (browser allows it)
- ✅ But when date is selected, **no slots appear**
- ✅ Console shows `[AVAILABILITY] Date out of range`

**Test Edge Case:**
- Select date exactly **5 days from now**
- ✅ Slots should appear normally

**Reset for Later Tests:**
- Set "Max booking days ahead" back to **30**

---

### Test 9: Full End-to-End Flow

**Scenario:** Customer books a service, you block time, customer sees updated availability

**Setup:**
1. Working hours: Mon-Fri 9 AM - 5 PM (from previous tests)
2. Service with 30-minute duration exists

**Action:**
1. **Customer books**: Go to `/b/test-business`
   - Select service
   - Select Monday
   - See: 9:00 AM, 9:30 AM, 10:00 AM, etc.
   - Click 10:00 AM time slot
   - Fill booking form
   - Submit

2. **Check booking**: Go to `/dashboard/bookings`
   - New booking appears in "Pending" status
   - Shows Monday 10:00-10:30 AM

3. **You add break**: Go to `/dashboard/calendar`
   - Click Monday 11:00 AM slot
   - Add "Lunch Break" unavailable 11:00 AM - 12:30 PM
   - Save

4. **Customer books again**: Go to `/b/test-business` (new browser tab or refresh)
   - Select service and Monday again
   - See slots: 9:00, 9:30, 10:00 (all available)
   - 10:30 shows but might be available
   - 11:00, 11:30 are **gone** (blocked by lunch)
   - 12:00 and later show again

**Expected Result:**
- ✅ All steps complete without errors
- ✅ Bookings and blocks appear correctly in calendar
- ✅ Public availability respects manual blocks
- ✅ No "already booked" conflicts (system prevents overlap)

---

## Console Logging Reference

**All availability API logs start with `[AVAILABILITY]`** for easy filtering:

```
// In browser console or server logs, filter by:
// [AVAILABILITY]
```

**Key log points:**
1. Request received
2. Business found / not found
3. Service found / no duration
4. Settings loaded
5. Date validation
6. Working hours count
7. Events count
8. Slot generation stats

**If Debug Logs Don't Appear:**
- Check server-side logs (if running locally: `npm run dev` terminal)
- Availability API logs appear in **Next.js dev server console**
- Public booking page requests go to `/api/public/availability`
- Not visible in browser console (server-side logs)

---

## Common Issues & Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| "No available times" even with working hours | Working hours not marked `is_enabled: true` | Go to Hours tab and resave |
| Slots show yesterday's date | Timezone mismatch | Check timezone in Settings tab |
| Modal doesn't open on click | JavaScript error or event listener not attached | Check browser console, refresh page |
| Event saves but doesn't appear | Event `status` not set correctly | Verify `status: 'busy'` in code (not 'active') |
| Same slots show every time | Slot query cached | Hard refresh browser (Ctrl+Shift+R) |
| Can book past max_days_ahead | API doesn't validate | Check calendar settings are saved with low number |
| Grid looks broken on mobile | CSS grid overflow | Needs `overflow-x-auto` wrapper |

---

## Success Criteria ✅

- [ ] Public booking page shows slots when working hours exist
- [ ] Clicking a calendar slot opens modal with correct date/time
- [ ] Adding event via modal saves to database
- [ ] Manual blocks appear in calendar grid
- [ ] Manual blocks reduce available slots in public booking
- [ ] Notice hours setting blocks early-day bookings
- [ ] Max days setting prevents booking too far ahead
- [ ] All time labels correct (9 AM through 6 PM)
- [ ] Calendar grid looks professional and is clickable
- [ ] No TypeScript errors on build
- [ ] No console JavaScript errors
- [ ] Responsive on mobile (grid scrollable)

---

## Next Steps if Issues Found

1. Check server logs (if running dev server)
2. Check browser console (F12)
3. Check Supabase Data Editor for data integrity
4. Review database schema matches code expectations
5. Check RLS policies allow needed operations
6. Test with fresh database if RLS unclear

