-- Ensure Avatars Bucket Exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for Avatars Bucket
-- 1. Public Read (Anyone can see avatars)
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
CREATE POLICY "Public Access Avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- 2. Auth Upload (Users can upload their own avatar)
DROP POLICY IF EXISTS "Auth Upload Avatars" ON storage.objects;
CREATE POLICY "Auth Upload Avatars"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- 3. Auth Update (Users can replace their own avatar)
DROP POLICY IF EXISTS "Auth Update Avatars" ON storage.objects;
CREATE POLICY "Auth Update Avatars"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );

-- 4. Auth Delete (Users can delete their own avatar)
DROP POLICY IF EXISTS "Auth Delete Avatars" ON storage.objects;
CREATE POLICY "Auth Delete Avatars"
ON storage.objects FOR DELETE
USING ( bucket_id = 'avatars' AND auth.uid() = owner );
