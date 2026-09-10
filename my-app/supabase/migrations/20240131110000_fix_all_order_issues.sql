-- 1. Pastikan semua kolom yang dibutuhkan ADA
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'qris',
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- 2. Update RLS Policy: Izinkan Customer UPDATE order punya sendiri
-- (Diperlukan untuk tombol "Confirm Order" / Cash dan "Batalkan Pesanan")

DROP POLICY IF EXISTS "Users can update own orders" ON orders;

CREATE POLICY "Users can update own orders"
ON orders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Refresh permission cache (Penting!)
NOTIFY pgrst, 'reload config';
