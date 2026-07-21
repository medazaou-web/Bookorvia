-- Add customizable public page style options for business profiles

ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS button_text_color VARCHAR(20) DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS background_style VARCHAR(30) DEFAULT 'orbs';

COMMENT ON COLUMN public.businesses.button_text_color IS 'Text color used on primary public-page buttons';
COMMENT ON COLUMN public.businesses.background_style IS 'Background visual preset for public business page (orbs, mesh, stripes, grid, spotlight)';
