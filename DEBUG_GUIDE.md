## Bookorvia Availability API - Debug & Testing Guide

### Overview
The availability API has been redesigned with comprehensive debug mode to identify why slots are showing empty.

### Files Changed
1. `app/api/public/availability/route.ts` - Complete rewrite with debug mode
2. `app/b/[slug]/BookingForm.tsx` - Updated to use new API response format and added logging
3. `lib/supabase/admin.ts` - Server-only admin client (existing)

### Debug Mode Usage

#### Enable Debug Output
Add `&debug=1` to any availability API call:

```
/api/public/availability?slug=YOUR_SLUG&serviceId=YOUR_SERVICE_ID&date=2026-06-29&debug=1
```

#### What Debug Returns
```json
{
  "slots": [],
  "debug": {
    "received": {
      "slug": "your-business",
      "serviceId": "service-uuid",
      "date": "2026-06-29"
    },
    "businessFound": true,
    "businessId": "business-uuid",
    "serviceFound": true,
    "service": {
      "id": "service-uuid",
      "name": "Haircut",
      "duration_minutes": 60,
      "is_active": true
    },
    "settingsUsed": {
      "timezone": "Africa/Casablanca",
      "slot_interval_minutes": 30,
      "buffer_minutes": 0,
      "min_notice_hours": 0,
      "max_booking_days_ahead": 30
    },
    "selectedDate": "2026-06-29",
    "dayOfWeek": 1,
    "workingHoursFound": 1,
    "workingHours": [
      {
        "day_of_week": 1,
        "start_time": "09:00:00",
        "end_time": "18:00:00",
        "is_enabled": true
      }
    ],
    "blockingEventsFound": 0,
    "blockingEvents": [],
    "slotsBeforeBlocking": [
      {
        "label": "09:00",
        "starts_at": "2026-06-29T09:00:00.000Z",
        "ends_at": "2026-06-29T10:00:00.000Z"
      },
      ...more slots...
    ],
    "slotsAfterBlocking": [
      // Same as slotsBeforeBlocking unless events block some
    ],
    "reason": "Generated 17 slots, 0 blocked, 17 available"
  }
}
```

### Testing Checklist

#### Step 1: Prepare Test Data
- Create a test business with slug: `test-business`
- Add a service (e.g., "Haircut") with:
  - `duration_minutes: 60`
  - `is_active: true`
- Set working hours for at least one day:
  - Example: Monday 09:00–18:00
  - `is_enabled: true`

#### Step 2: Test API Directly (Server)
Open in browser or curl:
```
/api/public/availability?slug=test-business&serviceId=YOUR_SERVICE_ID&date=2026-06-29&debug=1
```

Check each field:

| Field | Expected | If Wrong | Fix |
|-------|----------|----------|-----|
| `businessFound` | `true` | Check slug exists in database |
| `serviceFound` | `true` | Check serviceId and business match |
| `service.duration_minutes` | `> 0` | Add duration_minutes to service |
| `workingHoursFound` | `> 0` | Set working hours for the date's day of week |
| `dayOfWeek` | 0-6 matching the date | Should be automatic |
| `slotsBeforeBlocking.length` | Should have slots | Check working hours parsing |
| `slotsAfterBlocking.length` | Should match before unless events block | Check event overlap logic |
| `reason` | Shows slot count | Describes what happened |

#### Step 3: Test Public Booking Page
1. Navigate to `/b/test-business`
2. Open browser DevTools Console
3. Select your service
4. Pick a date with working hours
5. Check console logs:
   ```
   Selected service ID: service-uuid
   Fetching availability from: /api/public/availability?slug=test-business&serviceId=service-uuid&date=2026-06-29
   Availability response: { slots: [...], ... }
   Found slots: 17
   ```
6. Verify slots appear on the page

#### Step 4: Test with Calendar Events
1. In dashboard, add a calendar event:
   - Date: same as test date
   - Time: 13:00–14:00
   - Type: "Manual Reservation" (saves as `status: busy`)
2. Go back to public page
3. API debug should show:
   - `blockingEventsFound: 1`
   - `slotsBeforeBlocking: 17` (all slots)
   - `slotsAfterBlocking: 15` (13:00 and 13:30 removed)
4. Public page should still show slots, just without 13:00 and 13:30

#### Step 5: Test Edge Cases
- **No working hours**: API returns empty slots ✓
- **Service has no duration**: API returns error "This service is not available for online booking yet." ✓
- **Date in past**: API returns empty slots ✓
- **Date beyond max_booking_days_ahead**: API returns empty slots ✓
- **No calendar events**: All working hour slots available ✓
- **Cancelled events**: Should NOT block slots ✓

### Troubleshooting

If `slotsBeforeBlocking` is empty:

1. Check `workingHoursFound > 0`
   - If 0: No working hours found for that day
   - Fix: Set working hours with `is_enabled = true`

2. Check `dayOfWeek` matches the date's day
   - 0 = Sunday, 1 = Monday, etc.
   - Use test date and manually verify

3. Check `settingsUsed.slot_interval_minutes`
   - Default: 30
   - If changed, verify it's a positive number

4. Check time format in working hours:
   - Expected: "09:00:00" or "09:00"
   - API handles both

If `slotsAfterBlocking` is less than `slotsBeforeBlocking`:

1. Check `blockingEventsFound > 0`
2. Verify event has `status: busy` or `tentative`
3. Check event time overlaps with slots
4. Each blocked slot should be listed in console logs

If public page shows "No available times" but debug shows slots:

1. Check browser console for errors
2. Verify `data.slots` is being read (not `data.availableSlots`)
3. Check `selectedService` has `duration_minutes`
4. Verify date is selected

### Server Logs

Terminal will show logs like:
```
[AVAILABILITY] Request: slug=test-business, serviceId=..., date=2026-06-29, debug=false
[AVAILABILITY] Business found: business-uuid
[AVAILABILITY] Service found: Haircut, 60 min duration
[AVAILABILITY] Settings: timezone=Africa/Casablanca, interval=30min, buffer=0min, notice=0h, max_days=30
[AVAILABILITY] Selected date: Mon Jun 29 2026, day of week: 1 (0=Sun, 6=Sat)
[AVAILABILITY] Date range: today=Tue Jun 23 2026, maxDate=Fri Jul 24 2026, selected=Mon Jun 29 2026
[AVAILABILITY] Found 1 working hour(s) for day 1
[AVAILABILITY] Processing work hours: 09:00–18:00
[AVAILABILITY] Total: 17 generated, 0 blocked, 17 available
```

### When to Remove Debug Mode

After confirming everything works:
- Debug mode only runs when `?debug=1` is added
- No debug info shown to public by default
- Safe to leave in production code

### API Response Keys

**Normal response** (no debug):
```json
{
  "slots": [...]
}
```

**Debug response** (with `&debug=1`):
```json
{
  "slots": [...],
  "debug": {...}
}
```

The `slots` key is always present, debug is optional.

### Build Status
✅ Compiled successfully in 32.4s
✅ No TypeScript errors
✅ All routes compiling
