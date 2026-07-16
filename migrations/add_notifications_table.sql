-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('booking', 'review', 'update', 'reminder')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_notifications_business_id ON public.notifications(business_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policy: business owners can see their notifications (through businesses table)
CREATE POLICY "business_owners_can_view_own_notifications" ON public.notifications
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses
      WHERE user_id = auth.uid()
    )
  );

-- RLS policy: business owners can update their notifications (mark as read, etc.)
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
CREATE POLICY "business_owners_can_delete_own_notifications" ON public.notifications
  FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM public.businesses
      WHERE user_id = auth.uid()
    )
  );

-- RLS policy: admin can create notifications (via service role)
CREATE POLICY "notifications_insert_admin" ON public.notifications
  FOR INSERT
  WITH CHECK (true);
