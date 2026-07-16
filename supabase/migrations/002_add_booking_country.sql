-- Add booking_country field to booking_requests table
-- Tracks which country the customer is booking from

ALTER TABLE public.booking_requests 
ADD COLUMN IF NOT EXISTS booking_country VARCHAR(2) DEFAULT 'US';

-- Create index for queries filtering by booking_country
CREATE INDEX IF NOT EXISTS idx_booking_requests_country ON public.booking_requests(booking_country);

-- Add comment for clarity
COMMENT ON COLUMN public.booking_requests.booking_country IS 'ISO country code where the booking request originated (e.g., US, MA, FR)';
