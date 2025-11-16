-- =====================================================
-- Migration 004: Make raw_audio_url Nullable
-- =====================================================
-- Purpose: Allow jobs to start with source_url (miStable)
-- without requiring raw_audio_url upfront
-- =====================================================

-- Make raw_audio_url nullable
ALTER TABLE studio_jobs 
ALTER COLUMN raw_audio_url DROP NOT NULL;

COMMENT ON COLUMN studio_jobs.raw_audio_url IS 'URL/path to raw audio file (nullable - populated after MP3 extraction for miStable workflow)';

-- =====================================================
-- Verification
-- =====================================================

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'studio_jobs'
  AND column_name = 'raw_audio_url';

-- Expected: is_nullable = 'YES'
-- =====================================================
