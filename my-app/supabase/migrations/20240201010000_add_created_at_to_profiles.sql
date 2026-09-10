-- Add created_at column to profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Backfill created_at from auth.users for existing profiles
-- This ensures we have the real join date, not just the migration date
DO $$
BEGIN
  UPDATE public.profiles p
  SET created_at = u.created_at
  FROM auth.users u
  WHERE p.id = u.id
  AND p.created_at IS NULL; -- Only update if currently null (or default wasn't accurate enough if we care about precision, but mainly for nulls)
  
  -- Better approach: Just overwrite all to match auth.users exactly
  UPDATE public.profiles p
  SET created_at = u.created_at
  FROM auth.users u
  WHERE p.id = u.id;
END $$;
