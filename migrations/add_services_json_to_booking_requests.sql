-- Add services_json column to booking_requests table for multi-service bookings
-- This stores the full service details (id, name, duration, price) as JSON

ALTER TABLE public.booking_requests
ADD COLUMN IF NOT EXISTS services_json jsonb DEFAULT NULL;

-- Update the service column to be nullable/text for combined service names
ALTER TABLE public.booking_requests
ALTER COLUMN service DROP NOT NULL,
ALTER COLUMN service TYPE text USING service::text;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS booking_requests_services_json_idx ON public.booking_requests USING gin(services_json);

-- Optional: Add a comment explaining the column
COMMENT ON COLUMN public.booking_requests.services_json IS 'JSON array of service details for multi-service bookings: [{id, name, duration_minutes, price}, ...]';
