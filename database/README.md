# Evolution Studios Engine - Database Schema

## Overview

This directory contains the database schema and migrations for the Evolution Studios Engine microservices architecture.

## Schema: `studio_jobs` Table

The `studio_jobs` table serves as the persistent memory for the Orchestrator microservice, tracking the complete workflow from raw audio input to brand-compliant refined output.

### Table Structure

| Column Name | Data Type | Constraints | Purpose |
|-------------|-----------|-------------|---------|
| `job_id` | `uuid` | Primary Key, Default: `gen_random_uuid()` | Unique identifier for the entire workflow |
| `created_at` | `timestamp with time zone` | Not Null, Default: `now()` | Records when the job was accepted by the Orchestrator |
| `status` | `text` | Not Null, Check Constraint | Tracks job location in the pipeline: `NEW`, `TRANSCRIBING`, `ENRICHING`, `REFINING`, `COMPLETE`, `FAILED` |
| `user_id` | `uuid` | Not Null, Foreign Key to `auth.users` | Links job to authenticated user for RLS and frontend display |
| `raw_audio_url` | `text` | Not Null | Path or URL to source audio file (Supabase Storage) |
| `raw_transcript` | `text` | Nullable | Output from the Transcriber service (Whisper) |
| `refined_text` | `text` | Nullable | Final brand-compliant "Gold Standard" output from LLM Refiner |
| `system_prompt_used` | `text` | Not Null | Specific LLM system prompt used (defaults to Brand Bible prompt) |
| `processing_time_ms` | `integer` | Nullable | Total elapsed time for the job (performance monitoring) |
| `error_details` | `jsonb` | Nullable | Detailed error logs if status is `FAILED` |

### Workflow Status Flow

```
NEW → TRANSCRIBING → ENRICHING → REFINING → COMPLETE
                                              ↓
                                           FAILED (on error)
```

### Row Level Security (RLS)

The table implements Row Level Security to ensure data isolation and user privacy, aligning with the Brand Bible's emphasis on **Trust** and **Regulated** operation.

**Policies:**
- **SELECT**: Users can only view their own jobs (`auth.uid() = user_id`)
- **INSERT**: Users can only create jobs for themselves (`auth.uid() = user_id`)
- **UPDATE**: Users can only update their own jobs (`auth.uid() = user_id`)

### Performance Optimization

**Indexes:**
- `idx_studio_jobs_user_id`: Fast lookup by user
- `idx_studio_jobs_status`: Fast filtering by status
- `idx_studio_jobs_created_at`: Fast sorting by creation time (DESC)

### Automatic Processing Time Calculation

A trigger automatically calculates and stores the `processing_time_ms` when a job transitions to `COMPLETE` status.

## Deployment

### Supabase Setup

1. Navigate to your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `migrations/001_create_studio_jobs_table.sql`
4. Execute the migration

### Verification

After running the migration, verify:

```sql
-- Check table exists
SELECT * FROM studio_jobs LIMIT 1;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'studio_jobs';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'studio_jobs';
```

## Integration with Microservices

### Orchestrator Service

The Orchestrator microservice will:
1. Create a new job record with status `NEW`
2. Update status as the job progresses through the pipeline
3. Store outputs from each service (transcript, refined text)
4. Handle errors and update `error_details` on failure

### Example Usage

```python
# Create new job
job = supabase.table('studio_jobs').insert({
    'user_id': user_id,
    'status': 'NEW',
    'raw_audio_url': audio_url,
    'system_prompt_used': default_brand_bible_prompt
}).execute()

# Update status
supabase.table('studio_jobs').update({
    'status': 'TRANSCRIBING'
}).eq('job_id', job_id).execute()

# Store transcript
supabase.table('studio_jobs').update({
    'status': 'ENRICHING',
    'raw_transcript': transcript_text
}).eq('job_id', job_id).execute()

# Complete job
supabase.table('studio_jobs').update({
    'status': 'COMPLETE',
    'refined_text': final_output
}).eq('job_id', job_id).execute()
```

## Brand Bible Alignment

This schema design aligns with Evolution Studios' Brand Bible:

- **Trust**: RLS ensures user data privacy and isolation
- **Regulated**: Structured workflow with clear status tracking
- **Ownership, Evolved**: Users have full visibility into their job processing
- **Understated Authority**: Clean, professional data structure without unnecessary complexity

## Future Enhancements

Potential additions:
- `enrichment_entities` (jsonb): Store extracted entities from Enrichment service
- `model_version` (text): Track which model version was used
- `retry_count` (integer): Track retry attempts for failed jobs
- `priority` (integer): Job queue prioritization
