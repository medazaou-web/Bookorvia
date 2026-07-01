# 🚀 Quick Start Testing Guide

**Time to complete**: ~15 minutes  
**No setup required** - Use existing business/services

---

## 5-Minute Quick Test

### Step 1: Setup Working Hours (2 min)

Go to **`/dashboard/calendar`**

Click **"⏰ Hours"** tab

Check: **Monday through Friday**
- Start: **9:00 AM**
- End: **5:00 PM**

Click **"✓ Save Working Hours"**

Expected: ✅ Success message appears

---

### Step 2: Test Public Booking (2 min)

Go to **`/b/your-business-slug`** (public booking page)

Select any service with `duration_minutes` set

Select **Monday** (or any enabled day)

Wait for time slots to load

Expected: ✅ See times like: 9:00, 9:30, 10:00, 10:30, ... 16:30, 17:00

---

### Step 3: Test Calendar Slot Click (1 min)

Go back to **`/dashboard/calendar`**

Verify you're on **"📅 Calendar"** tab

**Click any time slot** (e.g., Monday 2:00 PM)

Expected: ✅ Modal opens with date/time prefilled

---

## That's It! ✅

If all three steps work, the fixes are successful.

---

## 15-Minute Detailed Test

### Test 1: Verify Working Hours Saved (2 min)

**Action**:
1. `/dashboard/calendar` → "⏰ Hours" tab
2. Enable **Monday-Friday** with **9:00 - 17:00**
3. Click "Save"
4. Refresh page (F5)

**Expected**:
- ✅ Hours still checked and show correct times
- ✅ Message appears on save
- ✅ Data persists after refresh

---

### Test 2: Public Booking Shows Slots (3 min)

**Action**:
1. `/b/your-business`
2. Select a service (must have `duration_minutes`)
3. Select **Monday** (or any Mon-Fri date)
4. Open **F12 console**
5. Filter by `[AVAILABILITY]`

**Expected**:
- ✅ Time slots appear (9:00, 9:30, 10:00, etc.)
- ✅ Console shows `[AVAILABILITY]` logs
- ✅ Last log: "X slots available"
- ✅ Logs show no errors

**Logs to look for**:
```
[AVAILABILITY] Business found: [id]
[AVAILABILITY] Service found: 30 min duration
[AVAILABILITY] Found 1 working hour(s) for day 1
[AVAILABILITY] Found 0 event(s) on 2026-01-20
[AVAILABILITY] Generated 18 slots, 0 blocked, 18 available
```

---

### Test 3: Click Calendar Slot (3 min)

**Action**:
1. `/dashboard/calendar`
2. Ensure "📅 Calendar" tab is active
3. Look at the week grid
4. Click **Tuesday 11:00 AM** (or any time slot)

**Expected**:
- ✅ Modal appears titled "Add Event"
- ✅ Start Date filled: Tuesday's date
- ✅ Start Time filled: 11:00
- ✅ End Time filled: 11:30 (30 min default)
- ✅ Title field focused (cursor in it)

**If modal doesn't open**:
- Hard refresh: **Ctrl+Shift+R**
- Check browser console for errors (F12)
- Try clicking a different slot

---

### Test 4: Add Event from Slot (3 min)

**Action**:
1. Modal is open (from Test 3)
2. Type in Title: **"Quick Meeting"**
3. Leave Type as: **"Manual Reservation"**
4. Click **"✓ Add"**

**Expected**:
- ✅ Modal closes
- ✅ Success message appears briefly
- ✅ Calendar refreshes
- ✅ "Quick Meeting" appears in Tuesday 11:00 AM slot (colored blue)

**If event doesn't save**:
- Check browser console for errors
- Verify event appears in Supabase Data Editor
- Hard refresh and check again

---

### Test 5: Manual Block Reduces Availability (4 min)

**Action**:
1. Calendar still showing
2. Click **Monday 10:00 AM** slot
3. Fill form:
   - Title: **"Unavailable"**
   - Type: **"Unavailable"** (dropdown)
   - Start: Monday 10:00
   - End: Monday 11:30
4. Click **"✓ Add"**
5. Go to public booking: `/b/your-business`
6. Select same service, select **Monday**

**Expected Before**:
- 18 slots available (9:00-17:00)

**Expected After**:
- 16 slots available (10:00 and 10:30 removed)
- First slot now: 11:30 instead of 9:00
- Reason: "Unavailable" 10:00-11:30 blocks those times

**Console should show**:
```
[AVAILABILITY] Found 1 event(s) on 2026-01-20
[AVAILABILITY] Generated 18 slots, 2 blocked by events, 16 available
```

---

## Troubleshooting Matrix

| Issue | Check | Fix |
|-------|-------|-----|
| **No slots on booking page** | F12 console logs | 1. Check business_working_hours saved (go to Hours tab)<br>2. Ensure day is enabled<br>3. Check time range is wide enough |
| **Grid looks broken** | Visual layout | 1. Hard refresh (Ctrl+Shift+R)<br>2. Check screen resolution<br>3. Try mobile view |
| **Modal doesn't open** | F12 console | 1. Check for JavaScript errors<br>2. Verify click happened (inspect element)<br>3. Try different slot |
| **Event doesn't save** | Network tab | 1. Check network error in F12<br>2. Verify RLS policies<br>3. Check Supabase Data Editor |
| **Wrong times showing** | Console logs | 1. Check `day_of_week` (0-6)<br>2. Verify timezone setting<br>3. Check calendar settings |
| **Modal shows wrong time** | Modal content | 1. Selected hour might be off-by-one<br>2. Refresh page<br>3. Try again |

---

## Console Filter Tips

### See All Availability Logs Only

**DevTools**: F12 → Console tab

**Type in filter box**: `[AVAILABILITY]`

**Result**: Shows only availability API logs, no clutter

---

## What Success Looks Like

### ✅ Public Booking
```
Go to /b/your-business
Select service
Select Monday
Result: See 9:00, 9:30, 10:00, 10:30, ... 16:30, 17:00
Console: [AVAILABILITY] logs ending with "18 available"
```

### ✅ Calendar Slots
```
Go to /dashboard/calendar
Click Monday 2:00 PM
Result: Modal opens, shows:
  Start Date: Monday's date
  Start Time: 14:00
  End Time: 14:30
```

### ✅ Event Appears
```
After adding event:
Calendar refreshes
Event shows in grid with title and color
Public booking slots reduced
Console shows event found in next query
```

---

## Common Questions

**Q: Why 30-minute default duration?**  
A: Standard meeting/appointment length. Can be changed in modal.

**Q: Why 9 AM - 6 PM only?**  
A: MVP (minimum viable product) - common business hours. Can be extended if needed.

**Q: Where are the logs?**  
A: Browser console (F12) when loading public booking. API logs server-side if running locally.

**Q: Can I edit events after adding?**  
A: Not yet - future feature. For now, add a new event and delete old one (if delete implemented).

**Q: Does blocking affect existing bookings?**  
A: No - existing confirmed bookings show as is. Blocking only affects NEW availability slots.

**Q: What if I set overlapping blocks?**  
A: Works fine - availability API checks all events and finds overlaps.

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Run full test suite: See `TESTING_CALENDAR_FIXES.md`
2. Test on mobile device
3. Test with multiple services
4. Deploy to staging/production

### If Any Test Fails ❌
1. Check console logs for `[AVAILABILITY]` prefix
2. Reference troubleshooting matrix above
3. Check Supabase Data Editor for data
4. Review appropriate documentation file

---

## Files to Reference

- **Quick questions?** → `QUICK_REFERENCE_CALENDAR.md`
- **Full test suite?** → `TESTING_CALENDAR_FIXES.md`
- **Technical details?** → `CALENDAR_FIXES_SUMMARY.md`
- **Visual overview?** → `VISUAL_SUMMARY.md`
- **Final report?** → `COMPLETION_SUMMARY.md`

---

## Time Estimates

| Test | Time |
|------|------|
| Quick Test (all 3 steps) | 5 min |
| Working hours setup | 2 min |
| Public booking test | 2 min |
| Click slot test | 1 min |
| Add event test | 3 min |
| Block reduces availability | 4 min |
| **Total** | **~15 min** |

---

## Ready? Let's Go! 🚀

1. **Go to** `/dashboard/calendar`
2. **Click** "⏰ Hours" tab
3. **Enable** Mon-Fri 9-5
4. **Save**
5. **Go to** `/b/your-business`
6. **Select** service and Monday
7. **See** time slots appear ✅

**That's it!** If you see slots, the fix works. 🎉

