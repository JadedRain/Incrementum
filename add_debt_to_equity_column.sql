-- Add debt_to_equity column to stock table
-- Run this SQL on your database: postgresql://stockuser:E1d3nDesert56!0@database.incrementum.duckdns.org:31432/stock_data

ALTER TABLE incrementum.stock 
ADD COLUMN IF NOT EXISTS debt_to_equity NUMERIC(12, 4);

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_schema = 'incrementum' 
  AND table_name = 'stock'
  AND column_name = 'debt_to_equity';
