# API Routes Query Performance Analysis

## Summary
Identified **major N+1 query problems**, missing query optimizations, and data over-fetching across multiple routes. Critical performance issues in admin routes and public booking data routes.

---

## 🔴 CRITICAL ISSUES (N+1 QUERIES)

### 1. `app/api/admin/get-users` - **SEVERE N+1 PROBLEM**
**Path:** [app/api/admin/get-users/route.ts](app/api/admin/get-users/route.ts#L7)

**Current Query Operations:**
1. Fetches all profiles: `profiles.select('id, full_name')`
   - **Data fetched:** id, full_name (only 2 columns)
   - **Returns:** Every user in system (potentially thousands)
   
2. **THEN** loops through each profile and calls: `supabase.auth.admin.getUserById(profile.id)`
   - **N+1 Problem:** Makes **one API call per user** for emails
   - If you have 1,000 users → 1,000 individual auth API calls
   - If you have 10,000 users → 10,000 sequential calls (extremely slow)

**Performance Impact:**
- Response time: O(n) where n = number of users
- With 1,000 users: ~5-10 seconds minimum
- With 10,000 users: ~50-100 seconds

**Optimization Needed:**
❌ Cannot batch `auth.admin.getUserById()` calls directly
✅ **Solution:** Store emails in `profiles` table, sync from auth on user creation/update
✅ **Alternative:** Use Supabase Admin API batch endpoint or fetch all auth users server-side at once

---

### 2. `app/api/services/upload-image` - N+1 + Redundant Queries
**Path:** [app/api/services/upload-image/route.ts](app/api/services/upload-image/route.ts#L33)

**Current Query Operations:**
1. Query service: `services.select('id, business_id').eq('id', serviceId)`
   - **Data fetched:** 2 columns
2. Query business: `businesses.select('user_id').eq('id', business_id)`
   - **Data fetched:** 1 column
3. Update service: `services.update({ background_image_url }).eq('id', serviceId)`
   - **Data fetched:** All columns on update (unnecessary)

**Optimization Issues:**
- ⚠️ Could combine queries 1 & 2 using JOIN
- ⚠️ Selecting ALL columns on update unnecessary
- ⚠️ File validation happens BEFORE auth check (wasteful if auth fails)

**Optimized Query Count:** 2 → 1 (using JOIN or select specific columns)

---

### 3. `app/api/services/save-image-url` - N+1 + Redundant Queries
**Path:** [app/api/services/save-image-url/route.ts](app/api/services/save-image-url/route.ts#L22)

**Current Query Operations:**
1. Query service: `services.select('id, business_id').eq('id', serviceId)`
   - **Data fetched:** 2 columns
2. Query business: `businesses.select('user_id').eq('id', business_id)`
   - **Data fetched:** 1 column (ALREADY HAVE business_id from step 1)
3. Update service: `services.update({ background_image_url }).eq('id', serviceId)`
   - **Data fetched:** All columns on update

**Issue:** Query #2 is completely redundant - you could check authorization using just `business_id`

**Optimized Query Count:** 3 → 1

---

### 4. `app/api/admin/send-notification` - N+1 Queries
**Path:** [app/api/admin/send-notification/route.ts](app/api/admin/send-notification/route.ts#L45)

**Current Query Operations:**
1. Get all profiles: `profiles.select('id')`
   - **Data fetched:** Only id column
   - **Problem:** Uses `.in('id', targetUserIds)` but already filtered by `sendToAll` or `userIds`

2. **THEN** for each profile calls: `supabase.auth.admin.getUserById(profile.id)` (via Promise.all)
   - **Parallel N+1 Problem:** Makes one auth call per user
   - Even though parallel, still 1 call per user

3. Query businesses: `businesses.select('id, user_id, name').in('user_id', targetUserIds)`
   - **Data fetched:** 3 columns
   - **Multiple rows per user possible** (user can own multiple businesses)

4. Insert notifications: Loop through businesses and insert notification for each
   - **Creates notification per business, not per user**
   - If user has 3 businesses, gets 3 notifications

**N+1 Issues:**
- Fetching emails requires N auth API calls
- Business fetching could be combined with user fetch
- Notification creation loop could be batch inserted

**Optimized Query Count:** 4+ operations → 2 (if emails stored in profiles)

---

### 5. `app/api/send-booking-status-update` - Sequential Queries
**Path:** [app/api/send-booking-status-update/route.ts](app/api/send-booking-status-update/route.ts#L17)

**Current Query Operations:**
1. Fetch booking: `booking_requests.select('*').eq('id', bookingId)`
   - **Data fetched:** ALL columns (unnecessary)
   
2. Query profile for preferences: `profiles.select('email_notifications_enabled, email_status_notifications').eq('id', user_id)`
   - **Problem:** Requires authenticated user, but uses hardcoded profile query

3. Fetch business: `businesses.select('name').eq('id', booking.business_id)`
   - **Data fetched:** Only 1 column

4. Makes HTTP call to `/api/send-booking-notification` (separate API call)

**Issues:**
- Step #2 has a bug: queries `supabase.auth.getUser()` but doesn't check if it's business owner
- Over-fetches all booking columns
- Could batch fetch business and profile data

---

## ⚠️ HIGH PRIORITY ISSUES (Data Over-Fetching)

### 6. `app/api/init-notification-preferences` - Redundant Fetches
**Path:** [app/api/init-notification-preferences/route.ts](app/api/init-notification-preferences/route.ts#L16)

**Current Query Operations:**
1. Fetch profile: `profiles.select('*')`
   - **Data fetched:** ALL columns
   - **Problem:** Selecting everything, only need to check existence
   
2. If not exists, INSERT with defaults
3. If exists, UPDATE with default values (redundant logic)

**Optimization:**
- Use UPSERT instead of SELECT → IF logic
- Select only needed columns initially

---

### 7. `app/api/public/availability` - EXPENSIVE QUERY PATTERN
**Path:** [app/api/public/availability/route.ts](app/api/public/availability/route.ts#L40)

**Current Query Operations:**
1. Business lookup: `businesses.select('id').eq('slug', slug)`
   - **Data fetched:** 1 column

2. Service lookup: `services.select('id, name, duration_minutes, is_active')`
   - **Data fetched:** 4 columns
   - **Filter:** business_id + serviceId

3. Calendar settings: `business_calendar_settings.select('*')`
   - **Data fetched:** ALL columns (10+ columns)
   - **Default fallback if not found**

4. Working hours: `business_working_hours.select('*')`
   - **Data fetched:** ALL columns
   - **Multiple rows per day** (could be 10-20+ rows)
   - **Filter:** business_id + day_of_week + is_enabled

5. Calendar events: `calendar_events.select('starts_at, ends_at, status')`
   - **Data fetched:** 3 columns
   - **Filter:** business_id + date range
   - **Could be 100s of events** for large calendar

6. Booking requests: `booking_requests.select('starts_at, ends_at, status')`
   - **Data fetched:** 3 columns
   - **Filter:** business_id + date range
   - **Could be 100s of bookings**

**Performance Issues:**
- 6 separate queries
- Steps 5 & 6 fetch potentially thousands of rows for slot calculation
- Settings queried every time (could be cached)
- No pagination on events/bookings - could timeout on large dates

**Missing Optimization:**
- Calendar settings should be cached (rarely changes)
- Events/bookings could use indexes on (business_id, date range)
- Could combine queries 1-4 using JOINs
- Large datasets (events/bookings) need filtering or pagination

---

## 📊 DETAILED QUERY BREAKDOWN

| Route | Total Queries | N+1 Issues | Over-fetching | Columns Fetched |
|-------|---------------|-----------|----------------|-----------------|
| `auth/refresh` | 0 | ❌ No | ❌ No | N/A |
| `services/init-bucket` | 1 | ❌ No | ⚠️ All buckets | All |
| `services/upload-image` | 3 | ⚠️ Yes | ✅ Yes | 2+1+All |
| `services/save-image-url` | 3 | ⚠️ Yes | ✅ Yes | 2+1+All |
| `public/availability` | 6 | ❌ No | ⚠️ Yes | 1+4+All+All+3+3 |
| `admin/get-users` | 1+N | ✅ **CRITICAL** | ✅ Yes | 2+N auth calls |
| `admin/send-notification` | 3+N | ✅ **CRITICAL** | ✅ Yes | 1+N auth+3+N inserts |
| `notifications/create` | 1 | ❌ No | ❌ No | - |
| `init-notification-preferences` | 1-2 | ❌ No | ✅ Yes | All |
| `get-business-owner-email` | 2 | ⚠️ Yes | ⚠️ Yes | 2+1 auth |
| `send-booking-notification` | 0 | ❌ No | ❌ No | - |
| `send-booking-status-update` | 3 | ⚠️ Yes | ✅ Yes | All+2+1 |

---

## 🎯 OPTIMIZATION RECOMMENDATIONS BY PRIORITY

### Priority 1 - CRITICAL (Fix Now)

#### A. Fix `admin/get-users` N+1 Query
**Current Cost:** 1 + N API calls
**Target Cost:** 1 query
```typescript
// BEFORE
const profiles = await supabase.from('profiles').select('id, full_name');
const usersWithEmails = await Promise.all(
  profiles.map(p => supabase.auth.admin.getUserById(p.id)) // N+1!
);

// AFTER
// Option 1: Store email in profiles table
const users = await supabase
  .from('profiles')
  .select('id, full_name, email')
  .limit(1000); // Add pagination

// Option 2: Fetch auth users directly (all at once)
const { data: authUsers } = await supabase.auth.admin.listUsers();
const profiles = await supabase.from('profiles').select('id, full_name');
// Merge data in memory
```

#### B. Fix `admin/send-notification` N+1 Query
**Current Cost:** 1 + 1 + N + (N to fetch auth users)
**Target Cost:** 2-3 queries max
```typescript
// BEFORE
const profiles = await supabase.from('profiles').select('id');
const usersWithEmails = await Promise.all(
  profiles.map(p => supabase.auth.admin.getUserById(p.id)) // N+1!
);
const businesses = await supabase.from('businesses').select('id, user_id, name').in('user_id', targetUserIds);

// AFTER
// Fetch all users/emails at once
const { data: allUsers } = await supabase.auth.admin.listUsers();
const emailMap = new Map(allUsers.map(u => [u.id, u.email]));

// Fetch businesses in one query
const { data: businesses } = await supabase
  .from('businesses')
  .select('id, user_id, name')
  .in('user_id', targetUserIds)
  .limit(10000); // Add pagination

// Batch insert notifications
const notifications = businesses.map(b => ({...}));
await supabase.from('notifications').insert(notifications);
```

---

### Priority 2 - HIGH (Optimize Query Patterns)

#### C. Combine Query #1 & #2 in `services/upload-image` and `services/save-image-url`
**Current Cost:** 3 queries → **Target Cost:** 1 query
```typescript
// BEFORE
const { data: service } = await supabase.from('services').select('id, business_id').eq('id', serviceId);
const { data: business } = await supabase.from('businesses').select('user_id').eq('id', service.business_id);

// AFTER
const { data: service } = await supabase
  .from('services')
  .select('id, business_id, businesses(user_id)')
  .eq('id', serviceId)
  .single();

// Access: service.businesses.user_id
```

#### D. Fix Over-fetching in `send-booking-status-update`
**Current Cost:** All columns → **Target Cost:** Only needed columns
```typescript
// BEFORE
const { data: booking } = await supabase
  .from('booking_requests')
  .select('*')
  .eq('id', bookingId);

// AFTER
const { data: booking } = await supabase
  .from('booking_requests')
  .select('id, client_email, client_name, business_id, service, requested_date, requested_time, status')
  .eq('id', bookingId)
  .single();
```

---

### Priority 3 - MEDIUM (Performance Improvements)

#### E. Optimize `public/availability` Route
**Current Issue:** 6 queries + potentially 1000s of events/bookings fetched
**Recommendations:**
1. Cache `business_calendar_settings` (rarely changes)
2. Add query limits to `calendar_events` and `booking_requests`
3. Combine business + service queries using JOIN
4. Create index on `(business_id, day_of_week)` for working_hours
5. Use computed column for availability (calculate on write, not read)

```typescript
// BEFORE
const { data: events } = await supabase
  .from('calendar_events')
  .select('starts_at, ends_at, status')
  .eq('business_id', business.id)
  .gte('ends_at', dayStart.toISOString())
  .lte('starts_at', dayEnd.toISOString())
  .in('status', ['busy', 'tentative']); // No limit!

// AFTER
const { data: events } = await supabase
  .from('calendar_events')
  .select('starts_at, ends_at, status')
  .eq('business_id', business.id)
  .gte('ends_at', dayStart.toISOString())
  .lte('starts_at', dayEnd.toISOString())
  .in('status', ['busy', 'tentative'])
  .limit(500); // Prevent runaway queries

// Cache settings
const cacheKey = `calendar-settings-${business.id}`;
let settings = cache.get(cacheKey);
if (!settings) {
  const { data } = await supabase
    .from('business_calendar_settings')
    .select('timezone, slot_interval_minutes, buffer_minutes, min_notice_hours, max_booking_days_ahead')
    .eq('business_id', business.id)
    .single();
  settings = data || DEFAULT_SETTINGS;
  cache.set(cacheKey, settings, 3600); // 1 hour TTL
}
```

#### F. Use Upsert in `init-notification-preferences`
**Current Cost:** 1-2 queries → **Target Cost:** 1 query
```typescript
// BEFORE
const { data: profile } = await supabase.from('profiles').select('*');
if (!profile) {
  await supabase.from('profiles').insert({...});
} else {
  await supabase.from('profiles').update({...});
}

// AFTER
const { data: profile } = await supabase
  .from('profiles')
  .upsert({
    id: user.id,
    email: user.email,
    email_notifications_enabled: true,
    // ... other fields
  }, { onConflict: 'id' })
  .select()
  .single();
```

---

## 📈 EXPECTED PERFORMANCE IMPROVEMENTS

| Route | Current | After Fix | Improvement |
|-------|---------|-----------|------------|
| `admin/get-users` (1000 users) | ~5-10s | ~100ms | **50-100x faster** |
| `admin/send-notification` (5000 users) | ~25-50s | ~500ms | **50-100x faster** |
| `services/upload-image` | ~200ms | ~100ms | **2x faster** |
| `services/save-image-url` | ~200ms | ~100ms | **2x faster** |
| `public/availability` | ~500-1000ms | ~200ms | **3-5x faster** |
| `send-booking-status-update` | ~300ms | ~150ms | **2x faster** |

---

## 🔧 ADDITIONAL RECOMMENDATIONS

### Database Indexes Needed
```sql
-- For availability route
CREATE INDEX idx_business_working_hours_lookup 
  ON business_working_hours(business_id, day_of_week, is_enabled);

CREATE INDEX idx_calendar_events_lookup 
  ON calendar_events(business_id, starts_at, ends_at);

CREATE INDEX idx_booking_requests_lookup 
  ON booking_requests(business_id, starts_at, ends_at, status);

-- For service queries
CREATE INDEX idx_services_business 
  ON services(business_id, id);

-- For business queries
CREATE INDEX idx_businesses_slug 
  ON businesses(slug);
CREATE INDEX idx_businesses_user 
  ON businesses(user_id);
```

### Schema Changes Recommended
1. **Add email to profiles table** - Sync from auth on user creation
2. **Add last_updated timestamp to calendar_settings** - For cache invalidation
3. **Denormalize user emails** - Store in profiles to avoid auth API calls
4. **Add pagination support** - For admin/get-users and send-notification routes

### Caching Strategy
- Cache `business_calendar_settings` for 1 hour
- Cache `business_working_hours` for 24 hours
- Consider Redis for frequently accessed availability queries
- Cache auth user emails after first fetch

---

## ✅ Verification Checklist

- [ ] Audit all remaining routes in `app/api` not listed above
- [ ] Add database indexes recommended in SQL section
- [ ] Migrate email data to profiles table (with fallback)
- [ ] Replace N+1 queries with batch queries
- [ ] Add pagination to list endpoints
- [ ] Remove unnecessary column selections
- [ ] Implement caching for settings/working hours
- [ ] Load test after changes: 1000+ concurrent requests
- [ ] Monitor database query performance in Supabase dashboard
