-- Fix Supabase Storage Policies
-- Allow public uploads (for development)

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access for videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload audio" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own audio" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own audio" ON storage.objects;

-- Create permissive policies for development
-- Videos bucket
CREATE POLICY "Allow public uploads to videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Allow public reads from videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Allow public updates to videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos');

CREATE POLICY "Allow public deletes from videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos');

-- Audio bucket
CREATE POLICY "Allow public uploads to audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Allow public reads from audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio');

CREATE POLICY "Allow public updates to audio"
ON storage.objects FOR UPDATE
USING (bucket_id = 'audio');

CREATE POLICY "Allow public deletes from audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'audio');
