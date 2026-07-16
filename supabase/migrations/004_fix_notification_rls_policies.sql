/*
================================================================================
FIX NOTIFICATION RLS POLICIES
================================================================================

PROBLEM:
  Users could not update (mark as read) or delete notifications because
  RLS policies were missing for UPDATE and DELETE operations.
  
  Result: Notifications appeared deleted in UI but reappeared on page refresh
  because the database operations were being blocked by RLS.

SOLUTION:
  Add UPDATE and DELETE RLS policies to allow business owners to manage
  their own notifications while maintaining security.

================================================================================
*/

-- Drop existing incomplete policies if they exist
DROP POLICY IF EXISTS "business_owners_can_view_own_notifications" ON public.notifications;
DROP POLICY IF EXISTS "business_owners_can_update_own_notifications" ON public.notifications;
DROP POLICY IF EXISTS "business_owners_can_delete_own_notifications" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_admin" ON public.notifications;

-- Ensure RLS is enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policy: business owners can see their notifications
CREATE POLICY "business_owners_can_view_own_notifications" ON public.notifications
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses
      WHERE user_id = auth.uid()
    )
  );

-- RLS policy: business owners can update their notifications (mark as read, etc.)
-- This is the key fix - allows users to update notification.read field
CREATE POLICY "business_owners_can_update_own_notifications" ON public.notifications
  FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM public.businesses
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses
      WHERE user_id = auth.uid()
    )
  );

-- RLS policy: business owners can delete their notifications
-- This is the key fix - allows users to delete notifications
CREATE POLICY "business_owners_can_delete_own_notifications" ON public.notifications
  FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM public.businesses
      WHERE user_id = auth.uid()
    )
  );

-- RLS policy: service role (admin) can insert notifications
CREATE POLICY "notifications_insert_admin" ON public.notifications
  FOR INSERT
  WITH CHECK (true);

/*
VERIFICATION:
  After running this migration, users will be able to:
  ✅ View notifications for their businesses
  ✅ Mark notifications as read (UPDATE read = true)
  ✅ Delete notifications (DELETE)
  
  Notifications will now persist across page refreshes and re-logins.
*/
