-- Add global support fields to businesses table
-- Migration: Add currency, language, and booking_countries

ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS booking_countries TEXT[] DEFAULT ARRAY['US'];

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_businesses_currency ON public.businesses(currency);
CREATE INDEX IF NOT EXISTS idx_businesses_language ON public.businesses(language);

-- Add comment for clarity
COMMENT ON COLUMN public.businesses.currency IS 'Currency code (USD, EUR, GBP, MAD, BRL, etc.) - displayed to customers';
COMMENT ON COLUMN public.businesses.language IS 'Primary language code (en, es, fr)';
COMMENT ON COLUMN public.businesses.booking_countries IS 'Array of ISO country codes for phone validation (e.g., ARRAY[''US'', ''CA'', ''MX''])';
