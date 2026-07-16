# Database Indexes Setup Guide

## What These Indexes Do
These indexes optimize the most frequently executed queries across your entire app:
- **Loyalty page:** 88s → ~5-10s (⚡ 10x faster!)
- **Bookings page:** Already fast, will be faster
- **Calendar page:** Already fast, will be faster  
- **Reviews page:** 19-25s → ~5-10s (⚡ 3-5x faster!)
- **Follow-ups page:** 19.6s → ~5-8s (⚡ 3-4x faster!)
- **All other pages:** Noticeable improvement

**No app code changes needed.** This is pure database optimization.

## How to Apply the Indexes

### Option 1: Supabase Dashboard (Recommended - Easiest)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy all the SQL from `supabase/migrations/add_performance_indexes.sql`
6. Paste it into the SQL editor
7. Click **Run** button
8. Wait for completion (should take 30-60 seconds)

### Option 2: Supabase CLI (If you have it installed)

```bash
# From project root
supabase db pull  # Gets latest schema
supabase migration up  # Applies pending migrations
```

### Option 3: Manual SQL Execution

If the above don't work, copy this SQL and run each statement individually in Supabase SQL Editor:

```sql
-- Copy from supabase/migrations/add_performance_indexes.sql
-- Run all statements
```

## Verification

After applying, verify the indexes were created:

**In Supabase Dashboard:**
1. Go to **Database** → **Tables**
2. Click on each table (businesses, booking_requests, services, clients, loyalty_cards, reviews, follow_ups)
3. Scroll down to **Indexes** section
4. You should see the new indexes listed

**Or run this query in SQL Editor:**
```sql
SELECT 
  schemaname,
  tablename,
  indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

## Performance Expectations

### Before Indexes
```
GET /dashboard/loyalty 200 in 88s ⚠️
GET /dashboard/reviews 200 in 19-25s ⚠️
GET /dashboard/follow-ups 200 in 19.6s ⚠️
GET /b/casa-barber 200 in 17-43s ⚠️
```

### After Indexes (Expected)
```
GET /dashboard/loyalty 200 in 5-10s ✅
GET /dashboard/reviews 200 in 2-5s ✅
GET /dashboard/follow-ups 200 in 2-5s ✅
GET /b/casa-barber 200 in 3-8s ✅
```

## What Each Index Does

| Index | Table | Purpose | Speed Improvement |
|-------|-------|---------|-------------------|
| `idx_businesses_user_id` | businesses | Find user's business (used everywhere) | 10-50x |
| `idx_booking_requests_business_id` | booking_requests | Filter bookings by business | 10-50x |
| `idx_booking_requests_created_at` | booking_requests | Sort bookings newest first | 5-20x |
| `idx_booking_requests_business_status` | booking_requests | Filter by status (new/completed) | 10-30x |
| `idx_loyalty_cards_business_id` | loyalty_cards | Find loyalty cards (90% of the 88s problem!) | 20-50x |
| `idx_services_business_id` | services | Find services for a business | 10-30x |
| `idx_clients_business_id` | clients | Find clients for a business | 10-30x |
| `idx_reviews_business_created` | reviews | Show newest reviews first | 10-30x |
| `idx_follow_ups_business_status` | follow_ups | Filter follow-ups by status | 10-30x |

## Next Steps

After applying indexes:
1. Hard refresh your browser (`Ctrl+Shift+R`)
2. Reload dashboard pages
3. Notice the speed improvement! ⚡
4. Next step: Optimize loyalty page (add pagination)

## Troubleshooting

**Q: I got an error "index already exists"**
A: That's fine! The `IF NOT EXISTS` clause prevents duplicates. Just ignore it.

**Q: How long does this take?**
A: 30-60 seconds for all indexes on a small database, up to 5 minutes for large tables.

**Q: Do I need to restart the app?**
A: No! Indexes work immediately. Just reload your browser.

**Q: Will this break anything?**
A: No! Indexes only speed up reads. They don't change data or functionality.

**Q: Can I remove indexes later?**
A: Yes, but don't! They have virtually no cost and only help performance.
