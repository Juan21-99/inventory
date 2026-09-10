-- Add payment_data column to orders table if it doesn't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_data JSONB;

-- Comment for clarity
COMMENT ON COLUMN public.orders.payment_data IS 'Stores payment gateway response data (e.g., QRIS URL, transaction ID) for resuming payments.';
