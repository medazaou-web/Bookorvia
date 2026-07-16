-- Fix notification types to support user-friendly options
-- This drops the old constraint and creates a new one with the correct types

-- Drop the old check constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT notifications_type_check;

-- Add the new check constraint with the correct types
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check CHECK (type IN ('announcement', 'issue', 'update', 'maintenance'));
