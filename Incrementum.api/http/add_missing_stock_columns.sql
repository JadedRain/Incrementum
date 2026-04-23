-- Add missing columns to stock table including last_candle, quarterly updates tracking, and total_revenue
-- Run this SQL on your database

ALTER TABLE incrementum.stock 
ADD COLUMN IF NOT EXISTS day_percent_change NUMERIC(12, 6);

ALTER TABLE incrementum.stock 
ADD COLUMN IF NOT EXISTS high52_updated_at TIMESTAMP;

ALTER TABLE incrementum.stock 
ADD COLUMN IF NOT EXISTS low52_updated_at TIMESTAMP;

ALTER TABLE incrementum.stock 
ADD COLUMN IF NOT EXISTS quarterly_financials_updated_at TIMESTAMP;

ALTER TABLE incrementum.stock 
ADD COLUMN IF NOT EXISTS total_revenue BIGINT;

ALTER TABLE incrementum.stock 
ADD COLUMN IF NOT EXISTS last_candle VARCHAR(20);

-- Verify all columns were added
SELECT column_name, data_type, character_maximum_length, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_schema = 'incrementum' 
  AND table_name = 'stock'
  AND column_name IN ('day_percent_change', 'high52_updated_at', 'low52_updated_at', 'quarterly_financials_updated_at', 'total_revenue', 'last_candle')
ORDER BY ordinal_position;
