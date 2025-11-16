# ✅ Ready for Migration 003: Media & Brand Kit Columns

## 🎯 What This Migration Does

Adds 4 new columns to `studio_jobs` table to enable the full miStable video download and Brand Kit workflow:

1. **`source_url`** - Original miStable report URL
2. **`raw_mp4_path`** - Downloaded MP4 video location
3. **`raw_mp3_path`** - Extracted MP3 audio location  
4. **`trainer_logo_url`** - Trainer logo from Brand Kit

---

## 📋 Action Required: Run This in Supabase SQL Editor

### Step 1: Go to Supabase SQL Editor
**URL**: https://supabase.com/dashboard/project/coqtijrftaklcwgbnqef/sql

### Step 2: Copy and Run This SQL

```sql
-- 1. Add source URL column for miStable report link
ALTER TABLE studio_jobs 
ADD COLUMN source_url text;

COMMENT ON COLUMN studio_jobs.source_url IS 'Original miStable report URL (e.g., https://mistable.com/site/report/...)';

-- 2. Add columns to store downloaded media file paths/URLs
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
```

### Step 3: Verify Migration Succeeded

Run this verification query:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'studio_jobs'
  AND column_name IN ('source_url', 'raw_mp4_path', 'raw_mp3_path', 'trainer_logo_url')
ORDER BY ordinal_position;
```

**Expected Output**: 4 rows showing the new columns

---

## ✅ What's Already Done

### Code Updates: COMPLETE
- ✅ Updated `supabase_client.py` with new methods
- ✅ Added `update_media_paths()` method
- ✅ Added `update_trainer_logo()` method  
- ✅ Updated `create_job()` to accept new fields
- ✅ Created comprehensive documentation

### Files Created:
1. ✅ `database/migrations/003_add_media_and_brand_kit_columns.sql`
2. ✅ `MEDIA_WORKFLOW_GUIDE.md` - Complete workflow documentation
3. ✅ `READY_FOR_MIGRATION_003.md` - This file

---

## 🔄 After Migration: Rebuild Orchestrator

Once you've run the SQL migration, rebuild the orchestrator to use the updated code:

```bash
# Rebuild orchestrator with updated supabase_client.py
docker compose build orchestrator

# Restart orchestrator
docker compose up -d orchestrator
```

---

## 🧪 Test the New Workflow

### Test 1: Create Job with miStable URL

```bash
curl -X POST http://localhost:8080/v1/jobs/new \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "4a6e4cb7-9fa4-4333-85b4-1ac440119167",
    "source_url": "https://mistable.com/site/report/key/85276ccbe94c7588e720773dfdc33654/id/93d35d10659c38ebec18b0f65b88f799",
    "trainer_logo_url": "https://example.com/logos/stephen-gray-racing.png"
  }'
```

### Test 2: Update Media Paths

```python
python3 -c "
import sys
sys.path.insert(0, 'services/orchestrator')
from supabase_client import StudioJobsClient

db = StudioJobsClient()

job = db.update_media_paths(
    job_id='YOUR-JOB-ID-HERE',
    raw_mp4_path='supabase://storage/videos/test.mp4',
    raw_mp3_path='supabase://storage/audio/test.mp3'
)

print(f'✅ Updated: {job[\"job_id\"]}')
print(f'MP4: {job[\"raw_mp4_path\"]}')
print(f'MP3: {job[\"raw_mp3_path\"]}')
"
```

### Test 3: Verify in Supabase

```sql
SELECT 
    job_id,
    source_url,
    raw_mp4_path,
    raw_mp3_path,
    trainer_logo_url,
    status
FROM studio_jobs
ORDER BY created_at DESC
LIMIT 5;
```

---

## 📊 New API Methods Available

### Create Job with Media Fields

```python
from supabase_client import StudioJobsClient

db = StudioJobsClient()

job = db.create_job(
    user_id="4a6e4cb7-9fa4-4333-85b4-1ac440119167",
    source_url="https://mistable.com/site/report/...",
    trainer_logo_url="https://storage.supabase.co/logos/trainer.png"
)
```

### Update Media Paths

```python
job = db.update_media_paths(
    job_id="e9604980-03cd-4c71-b9fd-e78599da7af1",
    raw_mp4_path="supabase://storage/videos/report.mp4",
    raw_mp3_path="supabase://storage/audio/report.mp3"
)
```

### Update Trainer Logo

```python
job = db.update_trainer_logo(
    job_id="e9604980-03cd-4c71-b9fd-e78599da7af1",
    trainer_logo_url="https://storage.supabase.co/logos/trainer.png"
)
```

---

## 🎯 Migration Checklist

- [ ] **Step 1**: Run SQL migration in Supabase SQL Editor
- [ ] **Step 2**: Verify columns added (run verification query)
- [ ] **Step 3**: Rebuild orchestrator (`docker compose build orchestrator`)
- [ ] **Step 4**: Restart orchestrator (`docker compose up -d orchestrator`)
- [ ] **Step 5**: Test job creation with new fields
- [ ] **Step 6**: Test media path updates
- [ ] **Step 7**: Verify in Supabase table editor

---

## 📖 Documentation

- **Migration SQL**: `database/migrations/003_add_media_and_brand_kit_columns.sql`
- **Workflow Guide**: `MEDIA_WORKFLOW_GUIDE.md`
- **Updated Client**: `services/orchestrator/supabase_client.py`

---

## 🚀 What This Enables

### Immediate Benefits
- ✅ Track original miStable report URLs
- ✅ Store downloaded video files
- ✅ Store extracted audio files
- ✅ Link trainer logos for branded display

### Future Capabilities
- 🔄 Download service for miStable videos
- 🔄 MP4 → MP3 extraction pipeline
- 🔄 Brand Kit integration
- 🔄 Dev Studio video player with logo

---

**Status**: ✅ Code ready, waiting for SQL migration  
**Action**: Run SQL in Supabase SQL Editor  
**Time**: ~30 seconds to execute

---

*Ready to unblock the full miStable workflow!* 🎬
