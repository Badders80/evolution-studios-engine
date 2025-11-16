-- =====================================================
-- Migration 003: Add Media & Brand Kit Columns
-- =====================================================
-- Purpose: Enable full download-and-transcribe workflow
-- - Track source miStable report URLs
-- - Store downloaded MP4 video paths
-- - Store extracted MP3 audio paths
-- - Store trainer logo URLs for Dev Studio display
-- =====================================================
-- Run this in Supabase SQL Editor
-- Project: Evolution 3.0 (coqtijrftaklcwgbnqef)
-- =====================================================

-- 1. Add source URL column for miStable report link
ALTER TABLE studio_jobs 
ADD COLUMN source_url text;

COMMENT ON COLUMN studio_jobs.source_url IS 'Original miStable report URL (e.g., https://mistable.com/site/report/...)';

-- 2. Add columns to store downloaded media file paths/URLs
-- These are nullable because a job might start with raw text instead of video
ALTER TABLE studio_jobs 
ADD COLUMN raw_mp4_path text;

COMMENT ON COLUMN studio_jobs.raw_mp4_path IS 'Path to downloaded MP4 video in Supabase Storage';

ALTER TABLE studio_jobs 
ADD COLUMN raw_mp3_path text;

COMMENT ON COLUMN studio_jobs.raw_mp3_path IS 'Path to extracted MP3 audio in Supabase Storage (for Whisper transcription)';

-- 3. Add column to store Trainer's Brand Kit element (Logo URL)
ALTER TABLE studio_jobs 
ADD COLUMN trainer_logo_url text;

COMMENT ON COLUMN studio_jobs.trainer_logo_url IS 'URL to trainer logo from Brand Kit (for Dev Studio display)';

-- =====================================================
-- Verification Queries
-- =====================================================

-- Verify new columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'studio_jobs'
  AND column_name IN ('source_url', 'raw_mp4_path', 'raw_mp3_path', 'trainer_logo_url')
ORDER BY ordinal_position;

-- Check table structure
\d studio_jobs;

-- =====================================================
-- RLS Policy Verification
-- =====================================================
-- The existing RLS policies apply to all columns by default
-- No changes needed, but verify they're still active:

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'studio_jobs';

-- =====================================================
-- Expected Output After Migration
-- =====================================================
-- studio_jobs table should now have these additional columns:
-- - source_url (text, nullable)
-- - raw_mp4_path (text, nullable)
-- - raw_mp3_path (text, nullable)
-- - trainer_logo_url (text, nullable)
--
-- All existing RLS policies remain active and apply to new columns
-- =====================================================
