-- Fix typo in order status: 'process' -> 'processing'
UPDATE orders
SET status = 'processing'
WHERE status = 'process';

-- Optional: Ensure RLS allows this if running from client (Admin always has bypass)
-- This script is meant to be run in SQL Editor which has admin privileges.
