-- Run this query to see what columns actually exist in each table
-- This will help us fix the index migration

SELECT 
  table_name,
  column_name,
  data_type
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public' 
  AND table_name IN ('businesses', 'booking_requests', 'services', 'clients', 'loyalty_cards', 'profiles', 'reviews', 'follow_ups')
ORDER BY 
  table_name, 
  ordinal_position;
