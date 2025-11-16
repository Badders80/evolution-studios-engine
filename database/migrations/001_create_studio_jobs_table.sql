-- =====================================================
-- Evolution Studios Engine: studio_jobs Table
-- =====================================================
-- Purpose: Persistent memory for the Orchestrator microservice
-- Tracks the complete workflow: Audio → Transcript → Enrichment → Refinement
-- Ensures Brand Bible compliance and "Gold Standard" output delivery
-- =====================================================

-- 1. Create the studio_jobs table
CREATE TABLE IF NOT EXISTS studio_jobs (
    -- Primary identifier
    job_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamp tracking
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    
    -- Workflow status tracking
    status text NOT NULL CHECK (status IN ('NEW', 'TRANSCRIBING', 'ENRICHING', 'REFINING', 'COMPLETE', 'FAILED')),
    
    -- User association (for RLS and frontend display)
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Input: Raw audio file location
    raw_audio_url text NOT NULL,
    
    -- Pipeline outputs
    raw_transcript text,
    refined_text text,
    
    -- System configuration
    system_prompt_used text NOT NULL,
    
    -- Performance monitoring
    processing_time_ms integer,
    
    -- Error handling
    error_details jsonb
);

-- 2. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_studio_jobs_user_id ON studio_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_studio_jobs_status ON studio_jobs(status);
CREATE INDEX IF NOT EXISTS idx_studio_jobs_created_at ON studio_jobs(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE studio_jobs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policy: Allow users to SELECT (view) only their own jobs
CREATE POLICY "Users can only view their own studio jobs." 
ON studio_jobs 
FOR SELECT 
USING (auth.uid() = user_id);

-- 5. Create RLS Policy: Allow users to INSERT (create) their own jobs
CREATE POLICY "Users can insert their own studio jobs."
ON studio_jobs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 6. Create RLS Policy: Allow users to UPDATE only their own jobs
CREATE POLICY "Users can update their own studio jobs."
ON studio_jobs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Optional: Create a function to automatically update processing time
CREATE OR REPLACE FUNCTION calculate_processing_time()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'COMPLETE' AND OLD.status != 'COMPLETE' THEN
        NEW.processing_time_ms := EXTRACT(EPOCH FROM (now() - NEW.created_at)) * 1000;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to automatically calculate processing time on completion
CREATE TRIGGER trigger_calculate_processing_time
    BEFORE UPDATE ON studio_jobs
    FOR EACH ROW
    EXECUTE FUNCTION calculate_processing_time();

-- =====================================================
-- Notes:
-- - This schema aligns with the Brand Bible's emphasis on Trust and Regulated operation
-- - RLS ensures data isolation and user privacy
-- - The status enum tracks the complete two-layer pipeline: Transcriber → Enrichment → Refiner
-- - The refined_text column stores the "Gold Standard" brand-compliant output
-- =====================================================
