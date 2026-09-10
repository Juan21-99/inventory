-- Add payment_method column if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'qris';

-- Update existing records to default (optional)
UPDATE orders SET payment_method = 'qris' WHERE payment_method IS NULL;
