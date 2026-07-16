-- Add background_image_url column to services table
ALTER TABLE services ADD COLUMN background_image_url TEXT DEFAULT NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_services_background_image ON services(id) WHERE background_image_url IS NOT NULL;
