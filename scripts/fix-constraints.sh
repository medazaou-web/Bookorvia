#!/bin/bash
# PostgreSQL Constraint Fixes for Bookorvia
# 
# This script applies the necessary unique constraints to fix the upsert errors.
# 
# Prerequisites:
# - SUPABASE_SERVICE_ROLE_KEY environment variable set
# - SUPABASE_URL environment variable set
# 
# Usage:
# bash scripts/fix-constraints.sh
# 
# Or manually run in Supabase SQL Editor:

cat << 'EOF'
=== PostgreSQL Constraint Fixes ===

Run this SQL in your Supabase project > SQL Editor:

-- Fix 1: Add unique constraint to business_calendar_settings
-- This allows upsert to work properly for calendar settings
ALTER TABLE public.business_calendar_settings
ADD CONSTRAINT business_calendar_settings_business_id_unique
UNIQUE (business_id);

-- Verify the constraint was added
SELECT constraint_name, table_name, column_name
FROM information_schema.constraint_column_usage
WHERE table_name = 'business_calendar_settings'
  AND constraint_name LIKE '%unique%';

EOF

echo ""
echo "After running the SQL, test with:"
echo "  1. Go to /dashboard/calendar"
echo "  2. Click Settings tab"
echo "  3. Change a setting and save"
echo "  4. Should see success message"
echo ""
