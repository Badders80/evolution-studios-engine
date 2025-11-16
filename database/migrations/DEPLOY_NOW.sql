-- =====================================================
-- Evolution Studios Engine: studio_jobs Table
-- DEPLOYMENT SCRIPT FOR SUPABASE SQL EDITOR
-- =====================================================
-- Project: Evolution 3.0 (coqtijrftaklcwgbnqef)
-- Purpose: Unified authentication and job tracking
-- Deploy: Copy and paste this entire file into Supabase SQL Editor
-- =====================================================

-- 1. CREATE THE studio_jobs TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS studio_jobs (
    job_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    status text NOT NULL CHECK (status IN ('NEW', 'TRANSCRIBING', 'ENRICHING', 'REFINING', 'COMPLETE', 'FAILED')),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    raw_audio_url text NOT NULL,
    raw_transcript text,
    refined_text text,
    system_prompt_used text NOT NULL,
    processing_time_ms integer,
    error_details jsonb
);

-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_studio_jobs_user_id ON studio_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_studio_jobs_status ON studio_jobs(status);
CREATE INDEX IF NOT EXISTS idx_studio_jobs_created_at ON studio_jobs(created_at DESC);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE studio_jobs ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICY: SELECT (View)
-- =====================================================
-- Users can only view their own jobs
CREATE POLICY "Users can only view their own studio jobs." 
ON studio_jobs 
FOR SELECT 
USING (auth.uid() = user_id);

-- 5. CREATE RLS POLICY: INSERT (Create)
-- =====================================================
-- Users can only create jobs for themselves
CREATE POLICY "Users can insert their own studio jobs."
ON studio_jobs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 6. CREATE RLS POLICY: UPDATE (Modify)
-- =====================================================
-- Users can only update their own jobs
CREATE POLICY "Users can update their own studio jobs."
ON studio_jobs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. CREATE FUNCTION: Auto-calculate processing time
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_processing_time()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'COMPLETE' AND OLD.status != 'COMPLETE' THEN
        NEW.processing_time_ms := EXTRACT(EPOCH FROM (now() - NEW.created_at)) * 1000;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set search_path to avoid Supabase warning
ALTER FUNCTION public.calculate_processing_time() SET search_path = public;

-- 8. CREATE TRIGGER: Auto-update processing time on completion
-- =====================================================
CREATE TRIGGER trigger_calculate_processing_time
    BEFORE UPDATE ON studio_jobs
    FOR EACH ROW
    EXECUTE FUNCTION calculate_processing_time();

-- =====================================================
-- VERIFICATION QUERIES (Run these after deployment)
-- =====================================================

-- Check table exists
-- SELECT * FROM studio_jobs LIMIT 1;

-- Verify RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'studio_jobs';

-- Check policies (should show 3 policies)
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'studio_jobs';

-- =====================================================
-- DEPLOYMENT COMPLETE
-- =====================================================
-- Next Steps:
-- 1. Rebuild orchestrator: docker compose build orchestrator
-- 2. Restart orchestrator: docker compose up -d orchestrator
-- 3. Test connection: curl http://localhost:8080/health
-- =====================================================
