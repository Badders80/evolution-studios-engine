# 🎬 Media Workflow Guide - miStable Integration

## Overview

This guide documents the enhanced workflow for processing miStable trainer reports, including video download, audio extraction, transcription, and Brand Kit integration.

---

## 📊 New Schema Columns

### Migration 003: Media & Brand Kit Columns

Four new columns have been added to the `studio_jobs` table:

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `source_url` | text | Yes | Original miStable report URL |
| `raw_mp4_path` | text | Yes | Path to downloaded MP4 video in Supabase Storage |
| `raw_mp3_path` | text | Yes | Path to extracted MP3 audio for Whisper transcription |
| `trainer_logo_url` | text | Yes | URL to trainer logo from Brand Kit (for Dev Studio) |

### Why These Columns?

**`source_url`**: 
- Tracks the original miStable report link
- Enables audit trail and re-processing if needed
- Example: `https://mistable.com/site/report/key/85276ccbe94c7588e720773dfdc33654/id/93d35d10659c38ebec18b0f65b88f799`

**`raw_mp4_path`**: 
- Stores the location of the downloaded video file
- Enables video playback in Dev Studio
- Example: `supabase://storage/videos/user123/job456/trainer_report.mp4`

**`raw_mp3_path`**: 
- Stores the extracted audio file for Whisper transcription
- Optimized format for speech-to-text processing
- Example: `supabase://storage/audio/user123/job456/trainer_report.mp3`

**`trainer_logo_url`**: 
- Links to the trainer's logo from Brand Kit
- Enables branded display in Dev Studio
- Example: `https://storage.supabase.co/brand-kit/trainers/stephen-gray-racing/logo.png`

---

## 🔄 Enhanced Workflow

### Complete Pipeline: miStable → "Gold Standard" Output

```
1. User submits miStable report URL
   ↓
2. Orchestrator creates job with source_url
   ↓
3. Download MP4 video from miStable
   ↓ (store in Supabase Storage)
4. Update job with raw_mp4_path
   ↓
5. Extract MP3 audio from MP4
   ↓ (store in Supabase Storage)
6. Update job with raw_mp3_path
   ↓
7. Transcribe audio with Whisper (status: TRANSCRIBING)
   ↓ (store raw_transcript)
8. Enrich transcript - Layer 1 (status: ENRICHING)
   ↓ (remove jargon, banned phrases)
9. Refine with LLM - Layer 2 (status: REFINING)
   ↓ (apply Brand Bible)
10. Store final output (status: COMPLETE)
    ↓
11. Fetch trainer logo from Brand Kit
    ↓
12. Update job with trainer_logo_url
    ↓
13. Dev Studio displays: Video + Logo + Refined Text
```

---

## 💻 API Usage Examples

### Create Job with miStable URL

```python
from supabase_client import StudioJobsClient

db = StudioJobsClient()

# Create job with miStable source URL
job = db.create_job(
    user_id="4a6e4cb7-9fa4-4333-85b4-1ac440119167",
    source_url="https://mistable.com/site/report/key/85276ccbe94c7588e720773dfdc33654/id/93d35d10659c38ebec18b0f65b88f799",
    system_prompt="Brand Bible prompt...",
    trainer_logo_url="https://storage.supabase.co/brand-kit/trainers/stephen-gray-racing/logo.png"
)

print(f"Job created: {job['job_id']}")
print(f"Status: {job['status']}")  # NEW
```

### Update Media Paths After Download

```python
# After downloading and extracting media
db.update_media_paths(
    job_id="e9604980-03cd-4c71-b9fd-e78599da7af1",
    raw_mp4_path="supabase://storage/videos/user123/job456/trainer_report.mp4",
    raw_mp3_path="supabase://storage/audio/user123/job456/trainer_report.mp3"
)
```

### Update Trainer Logo

```python
# After fetching from Brand Kit
db.update_trainer_logo(
    job_id="e9604980-03cd-4c71-b9fd-e78599da7af1",
    trainer_logo_url="https://storage.supabase.co/brand-kit/trainers/stephen-gray-racing/logo.png"
)
```

### Retrieve Job with All Media

```python
job = db.get_job("e9604980-03cd-4c71-b9fd-e78599da7af1")

print(f"Source: {job['source_url']}")
print(f"Video: {job['raw_mp4_path']}")
print(f"Audio: {job['raw_mp3_path']}")
print(f"Logo: {job['trainer_logo_url']}")
print(f"Transcript: {job['raw_transcript']}")
print(f"Refined: {job['refined_text']}")
```

---

## 🎯 Orchestrator Integration

### Updated Job Creation Endpoint

```python
# services/orchestrator/app.py

@app.route('/v1/jobs/new', methods=['POST'])
def start_new_job():
    """
    Create job from miStable URL or direct audio
    """
    data = request.json
    user_id = data.get('user_id')
    
    # Option 1: miStable URL workflow
    source_url = data.get('source_url')
    trainer_logo_url = data.get('trainer_logo_url')
    
    # Option 2: Direct audio upload (legacy)
    supabase_file_id = data.get('supabase_file_id')
    
    if source_url:
        # New workflow: Download from miStable
        job = db.create_job(
            user_id=user_id,
            source_url=source_url,
            trainer_logo_url=trainer_logo_url,
            system_prompt=DEFAULT_SYSTEM_PROMPT
        )
        
        # Trigger async download and processing
        # TODO: Implement download service
        
    elif supabase_file_id:
        # Legacy workflow: Direct audio
        job = db.create_job(
            user_id=user_id,
            raw_audio_url=f"supabase://storage/{supabase_file_id}",
            system_prompt=DEFAULT_SYSTEM_PROMPT
        )
    
    return jsonify({
        "status": "success",
        "job_id": job['job_id'],
        "workflow": "mistable" if source_url else "direct_audio"
    })
```

---

## 📁 Supabase Storage Structure

### Recommended Storage Buckets

```
supabase-storage/
├── videos/                    # Raw MP4 files
│   └── {user_id}/
│       └── {job_id}/
│           └── trainer_report.mp4
│
├── audio/                     # Extracted MP3 files
│   └── {user_id}/
│       └── {job_id}/
│           └── trainer_report.mp3
│
└── brand-kit/                 # Trainer logos and assets
    └── trainers/
        └── {trainer_slug}/
            ├── logo.png
            ├── banner.jpg
            └── colors.json
```

### Storage Policies

```sql
-- Allow authenticated users to read their own media
CREATE POLICY "Users can read own media"
ON storage.objects FOR SELECT
USING (bucket_id IN ('videos', 'audio') AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow service role to write media
CREATE POLICY "Service role can write media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('videos', 'audio'));

-- Allow public read for brand kit
CREATE POLICY "Public can read brand kit"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-kit');
```

---

## 🔍 Query Examples

### Get All Jobs with Media

```sql
SELECT 
    job_id,
    user_id,
    status,
    source_url,
    raw_mp4_path,
    raw_mp3_path,
    trainer_logo_url,
    created_at,
    processing_time_ms
FROM studio_jobs
WHERE user_id = '4a6e4cb7-9fa4-4333-85b4-1ac440119167'
ORDER BY created_at DESC
LIMIT 10;
```

### Find Jobs Missing Media

```sql
-- Jobs with source URL but no downloaded media
SELECT job_id, source_url, status
FROM studio_jobs
WHERE source_url IS NOT NULL
  AND (raw_mp4_path IS NULL OR raw_mp3_path IS NULL)
  AND status != 'FAILED';
```

### Jobs Ready for Transcription

```sql
-- Jobs with MP3 but not yet transcribed
SELECT job_id, raw_mp3_path, status
FROM studio_jobs
WHERE raw_mp3_path IS NOT NULL
  AND raw_transcript IS NULL
  AND status IN ('NEW', 'TRANSCRIBING');
```

---

## 🎨 Dev Studio Integration

### Display Job with All Assets

```typescript
// Evolution 3.0 Dev Studio component

interface JobDisplay {
  job_id: string;
  source_url: string;
  raw_mp4_path: string;
  trainer_logo_url: string;
  refined_text: string;
  status: string;
}

function TrainerReportCard({ job }: { job: JobDisplay }) {
  return (
    <div className="report-card">
      {/* Trainer Logo */}
      <img src={job.trainer_logo_url} alt="Trainer Logo" />
      
      {/* Video Player */}
      <video src={job.raw_mp4_path} controls />
      
      {/* Refined Content */}
      <div className="refined-content">
        <h3>Gold Standard Output</h3>
        <p>{job.refined_text}</p>
      </div>
      
      {/* Source Link */}
      <a href={job.source_url} target="_blank">
        View Original Report
      </a>
      
      {/* Status */}
      <span className="status">{job.status}</span>
    </div>
  );
}
```

---

## 🧪 Testing the New Workflow

### Test 1: Create Job with miStable URL

```bash
curl -X POST http://localhost:8080/v1/jobs/new \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "4a6e4cb7-9fa4-4333-85b4-1ac440119167",
    "source_url": "https://mistable.com/site/report/key/85276ccbe94c7588e720773dfdc33654/id/93d35d10659c38ebec18b0f65b88f799",
    "trainer_logo_url": "https://storage.supabase.co/brand-kit/trainers/stephen-gray-racing/logo.png"
  }'
```

### Test 2: Update Media Paths

```python
python3 -c "
import sys
sys.path.insert(0, 'services/orchestrator')
from supabase_client import StudioJobsClient

db = StudioJobsClient()

# Update media paths
job = db.update_media_paths(
    job_id='YOUR-JOB-ID',
    raw_mp4_path='supabase://storage/videos/test/report.mp4',
    raw_mp3_path='supabase://storage/audio/test/report.mp3'
)

print(f'Updated: {job[\"job_id\"]}')
print(f'MP4: {job[\"raw_mp4_path\"]}')
print(f'MP3: {job[\"raw_mp3_path\"]}')
"
```

### Test 3: Verify in Supabase

```sql
-- Check the new columns
SELECT 
    job_id,
    source_url,
    raw_mp4_path,
    raw_mp3_path,
    trainer_logo_url
FROM studio_jobs
ORDER BY created_at DESC
LIMIT 5;
```

---

## 📋 Migration Checklist

### Step 1: Run SQL Migration ✅
- [ ] Go to Supabase SQL Editor
- [ ] Run `database/migrations/003_add_media_and_brand_kit_columns.sql`
- [ ] Verify columns added with verification query

### Step 2: Update Orchestrator ✅
- [x] Updated `supabase_client.py` with new methods
- [x] Added `update_media_paths()` method
- [x] Added `update_trainer_logo()` method
- [x] Updated `create_job()` to accept new fields

### Step 3: Rebuild Services
- [ ] Rebuild orchestrator: `docker compose build orchestrator`
- [ ] Restart orchestrator: `docker compose up -d orchestrator`

### Step 4: Test New Workflow
- [ ] Create job with source_url
- [ ] Update media paths
- [ ] Update trainer logo
- [ ] Verify in Supabase

---

## 🚀 Next Steps

### Phase 1: Download Service (TODO)
- [ ] Create download microservice for miStable videos
- [ ] Implement MP4 → MP3 extraction (FFmpeg)
- [ ] Upload to Supabase Storage
- [ ] Update job with media paths

### Phase 2: Brand Kit Integration (TODO)
- [ ] Create Brand Kit API
- [ ] Fetch trainer logos by name/slug
- [ ] Cache logos in Supabase Storage
- [ ] Auto-populate trainer_logo_url

### Phase 3: Dev Studio Display (TODO)
- [ ] Video player component
- [ ] Logo display
- [ ] Side-by-side: Video + Refined Text
- [ ] Link to original miStable report

---

## 📖 Documentation

- **Migration File**: `database/migrations/003_add_media_and_brand_kit_columns.sql`
- **Client Updates**: `services/orchestrator/supabase_client.py`
- **This Guide**: `MEDIA_WORKFLOW_GUIDE.md`

---

**Status**: ✅ Schema ready for migration  
**Action Required**: Run SQL migration in Supabase  
**Next**: Implement download service for miStable videos

---

*Last Updated: November 8, 2025*
