-- Update the mubasher scraper to store data in egypt_stocks table instead
-- First, let's check if we need to update the table structure to include the data we need

-- Add any missing columns if needed for better data display
ALTER TABLE egypt_stocks 
ADD COLUMN IF NOT EXISTS change_amount numeric,
ADD COLUMN IF NOT EXISTS open_price numeric,
ADD COLUMN IF NOT EXISTS high_price numeric,
ADD COLUMN IF NOT EXISTS low_price numeric,
ADD COLUMN IF NOT EXISTS previous_close numeric;