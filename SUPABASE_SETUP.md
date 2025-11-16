# Supabase Setup Guide - Evolution Studios Engine

## Overview

The Evolution Studios Engine uses the **same Supabase project** as Evolution 3.0 for unified authentication and data management.

**Project URL**: https://coqtijrftaklcwgbnqef.supabase.co  
**Dashboard**: https://supabase.com/dashboard/project/coqtijrftaklcwgbnqef

## Why Use the Same Supabase Project?

### 1. 🔑 Unified Authentication
- The `studio_jobs` table uses `user_id` as a Foreign Key to `auth.users`
- Row Level Security (RLS) uses `auth.uid()` for user isolation
- Users authenticated in Evolution 3.0 can seamlessly use the Engine
- No duplicate user management needed

### 2. ⚡ Simplified Architecture
- Single set of API credentials
- Centralized data management
- Evolution 3.0 frontend can directly read `refined_text` from `studio_jobs`
- Reduced operational complexity

### 3. 🔒 Security & Compliance
- Consistent RLS policies across all services
- Aligns with Brand Bible emphasis on Trust and Regulated operation
- User data isolation guaranteed

## Deployment Steps

### Step 1: Deploy Database Schema

1. **Open Supabase SQL Editor**:
   - Go to: https://supabase.com/dashboard/project/coqtijrftaklcwgbnqef/sql
   - Click "New Query"

2. **Copy the Migration SQL**:
   ```bash
   cat database/migrations/001_create_studio_jobs_table.sql
   ```

3. **Paste and Execute**:
   - Paste the entire SQL into the editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify Deployment**:
   ```sql
   -- Check table exists
   SELECT * FROM studio_jobs LIMIT 1;
   
   -- Verify RLS is enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'studio_jobs';
   
   -- Check policies (should show 3 policies)
   SELECT policyname, cmd 
   FROM pg_policies 
   WHERE tablename = 'studio_jobs';
   ```

### Step 2: Environment Configuration

The `.env` file has been created with your Supabase credentials:

```bash
# .env (already configured)
SUPABASE_URL=https://coqtijrftaklcwgbnqef.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
```

**Security Note**: The `.env` file should be added to `.gitignore` to prevent committing credentials.

### Step 3: Rebuild and Deploy Orchestrator

The Orchestrator has been updated to use Supabase:

```bash
# Rebuild the orchestrator with Supabase client
docker compose build orchestrator

# Restart the orchestrator
docker compose up -d orchestrator

# Verify it's running
docker logs evolution_api_orchestrator --tail 20
```

### Step 4: Test Supabase Connection

Create a test job to verify the connection:

```bash
# Test job creation (requires a valid user_id from auth.users)
curl -X POST http://localhost:8080/v1/jobs/new \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "your-user-id-here",
    "job_id": "test-supabase-001",
    "supabase_file_id": "test-audio.mp3"
  }'
```

## Database Schema

### `studio_jobs` Table

| Column | Type | Description |
|--------|------|-------------|
| `job_id` | uuid | Primary key, auto-generated |
| `created_at` | timestamp | Auto-set to now() |
| `status` | text | NEW → TRANSCRIBING → ENRICHING → REFINING → COMPLETE/FAILED |
| `user_id` | uuid | FK to auth.users (RLS enforced) |
| `raw_audio_url` | text | Source audio file location |
| `raw_transcript` | text | Output from Whisper |
| `refined_text` | text | **"Gold Standard" final output** |
| `system_prompt_used` | text | Brand Bible prompt used |
| `processing_time_ms` | integer | Auto-calculated on completion |
| `error_details` | jsonb | Error logs if failed |

### Row Level Security (RLS) Policies

1. **SELECT Policy**: Users can only view their own jobs
   ```sql
   USING (auth.uid() = user_id)
   ```

2. **INSERT Policy**: Users can only create jobs for themselves
   ```sql
   WITH CHECK (auth.uid() = user_id)
   ```

3. **UPDATE Policy**: Users can only update their own jobs
   ```sql
   USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id)
   ```

## Integration with Evolution 3.0

### Frontend Access

The Evolution 3.0 frontend can query jobs directly:

```typescript
// In your Next.js frontend
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Get user's jobs
const { data: jobs } = await supabase
  .from('studio_jobs')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })

// Get specific job's refined text
const { data: job } = await supabase
  .from('studio_jobs')
  .select('refined_text, status')
  .eq('job_id', jobId)
  .single()
```

### Real-time Updates

Enable real-time subscriptions for live status updates:

```typescript
// Subscribe to job status changes
const subscription = supabase
  .channel('studio_jobs_changes')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'studio_jobs',
      filter: `user_id=eq.${user.id}`
    },
    (payload) => {
      console.log('Job updated:', payload.new)
      // Update UI with new status
    }
  )
  .subscribe()
```

## Workflow Example

### Complete Pipeline Flow

```
1. User uploads audio in Evolution 3.0 frontend
   ↓
2. Frontend calls Orchestrator: POST /v1/jobs/new
   ↓
3. Orchestrator creates job in studio_jobs (status: NEW)
   ↓
4. Orchestrator → Transcriber (status: TRANSCRIBING)
   ↓
5. Store transcript in studio_jobs (status: ENRICHING)
   ↓
6. Orchestrator → Enrichment → LLM Refiner (status: REFINING)
   ↓
7. Store refined_text in studio_jobs (status: COMPLETE)
   ↓
8. Frontend displays refined_text to user
```

### Python Example (Orchestrator)

```python
from supabase_client import StudioJobsClient

# Initialize client
db = StudioJobsClient()

# Create new job
job = db.create_job(
    user_id="user-uuid-from-auth",
    raw_audio_url="https://storage.supabase.co/...",
    system_prompt="Brand Bible prompt..."
)

# Update status as processing progresses
db.update_status(job['job_id'], db.STATUS_TRANSCRIBING)

# Store transcript
db.store_transcript(job['job_id'], "Raw transcript text...")

# Store final output
db.store_refined_text(job['job_id'], "Brand-compliant refined text...")
```

## Monitoring & Maintenance

### Check Job Statistics

```sql
-- Count jobs by status
SELECT status, COUNT(*) 
FROM studio_jobs 
GROUP BY status;

-- Average processing time
SELECT AVG(processing_time_ms) as avg_ms 
FROM studio_jobs 
WHERE status = 'COMPLETE';

-- Recent failed jobs
SELECT job_id, error_details, created_at 
FROM studio_jobs 
WHERE status = 'FAILED' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Performance Optimization

The schema includes indexes for:
- `user_id` (fast user lookups)
- `status` (fast filtering)
- `created_at` (fast sorting)

### Backup & Recovery

Supabase automatically backs up your database. To export:

1. Go to Database → Backups in Supabase Dashboard
2. Download latest backup
3. Store securely

## Troubleshooting

### Issue: "relation 'studio_jobs' does not exist"
**Solution**: Run the migration SQL in Supabase SQL Editor

### Issue: "permission denied for table studio_jobs"
**Solution**: Verify RLS policies are created and user is authenticated

### Issue: "violates foreign key constraint"
**Solution**: Ensure `user_id` exists in `auth.users` table

### Issue: Orchestrator can't connect to Supabase
**Solution**: 
1. Check `.env` file has correct credentials
2. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
3. Rebuild orchestrator: `docker compose build orchestrator`

## Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use anon key for client-side** - It's safe with RLS enabled
3. **Use service role key for admin operations** - Only in secure backend
4. **Regularly audit RLS policies** - Ensure they're working correctly
5. **Monitor failed jobs** - Check `error_details` for security issues

## Next Steps

1. ✅ Deploy schema to Supabase
2. ✅ Configure environment variables
3. ✅ Rebuild orchestrator
4. ⏳ Test job creation
5. ⏳ Integrate with Evolution 3.0 frontend
6. ⏳ Enable real-time subscriptions
7. ⏳ Set up monitoring dashboard

---

**Status**: Ready for deployment  
**Last Updated**: November 8, 2025  
**Supabase Project**: coqtijrftaklcwgbnqef
