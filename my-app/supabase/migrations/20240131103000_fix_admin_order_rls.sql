-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;

-- 1. VIEW Policies
-- Admins can view ALL
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Users can view OWN
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- 2. INSERT Policies
-- Any authenticated user can create orders
CREATE POLICY "Users can create their own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- 3. UPDATE Policies
-- Admins can update ALL (Status changes)
CREATE POLICY "Admins can update all orders"
ON orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Simple profile check policy just in case
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING ( true );
