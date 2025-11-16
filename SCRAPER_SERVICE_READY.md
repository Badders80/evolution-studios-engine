# 🎬 Scraper Microservice - READY FOR DEPLOYMENT

## Overview

The Scraper microservice is the final architectural piece for complete miStable content automation. It handles the complex workflow of downloading trainer report videos and extracting audio for transcription.

---

## ✅ What's Been Created

### Service Files
1. ✅ `services/scraper/Dockerfile` - Container definition with FFmpeg
2. ✅ `services/scraper/requirements.txt` - Python dependencies
3. ✅ `services/scraper/app.py` - Flask API endpoints
4. ✅ `services/scraper/scraper_service.py` - Core scraping logic
5. ✅ `services/scraper/README.md` - Complete documentation

### Configuration
6. ✅ Updated `docker-compose.yml` - Added scraper service
7. ✅ Updated `.env` - Added SCRAPER_URL

---

## 🏗️ Architecture

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **HTML Parsing** | BeautifulSoup + lxml | Extract metadata from miStable reports |
| **Video Download** | yt-dlp | Download Vimeo embedded videos |
| **Audio Extraction** | FFmpeg | Convert MP4 → MP3 (16kHz mono for Whisper) |
| **API Server** | Flask + Gunicorn | REST endpoints |
| **Storage** | Supabase Storage | Upload processed media |

### CPU-Bound Service
- **Compute**: Ryzen 5 7600x (CPU only)
- **Port**: 8003
- **Container**: `mistable_scraper`

---

## 🔄 Complete Workflow

```
1. miStable Report URL
   ↓
2. Scraper: Fetch HTML
   ↓
3. Scraper: Parse & Extract
   - Trainer logo URL
   - Vimeo video URLs (from iframes)
   - Horse name
   - Trainer name
   - Report text
   ↓
4. Scraper: Download Videos (yt-dlp)
   - Best quality MP4
   - Saved to /tmp
   ↓
5. Scraper: Extract Audio (FFmpeg)
   - 16kHz sample rate (Whisper optimal)
   - Mono audio
   - High quality MP3
   ↓
6. Scraper: Upload to Supabase Storage
   - Videos → videos bucket
   - Audio → audio bucket
   ↓
7. Scraper: Return metadata + URLs
   ↓
8. Orchestrator: Update studio_jobs
   - raw_mp4_path
   - raw_mp3_path
   - trainer_logo_url
   ↓
9. Orchestrator: Trigger Transcriber
   - Pass MP3 URL
   ↓
10. Transcriber: Whisper processes audio
    ↓
11. Enrichment: Layer 1 Brand Compliance
    ↓
12. LLM Refiner: Layer 2 Brand Bible
    ↓
13. Complete: "Gold Standard" output ready
```

---

## 📋 API Endpoints

### 1. Health Check
```bash
GET http://localhost:8003/health
```

### 2. Scrape Report (Main Endpoint)
```bash
POST http://localhost:8003/scrape
Content-Type: application/json

{
  "source_url": "https://mistable.com/site/report/key/XXX/id/YYY",
  "job_id": "uuid",
  "user_id": "uuid",
  "upload_to_supabase": true
}
```

**Returns**:
- Extracted metadata (logo, horse name, trainer name)
- Downloaded video paths
- Extracted audio paths
- Uploaded Supabase URLs (if enabled)

### 3. Download Video (Testing)
```bash
POST http://localhost:8003/download-video

{
  "video_url": "https://vimeo.com/123456789",
  "job_id": "test"
}
```

### 4. Extract Audio (Testing)
```bash
POST http://localhost:8003/extract-audio

{
  "video_path": "/path/to/video.mp4"
}
```

---

## 🚀 Deployment Steps

### Step 1: Build the Service
```bash
docker compose build scraper
```

### Step 2: Start the Service
```bash
docker compose up -d scraper
```

### Step 3: Verify Health
```bash
curl http://localhost:8003/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "service": "scraper",
  "compute": "cpu",
  "capabilities": ["html_parsing", "video_download", "audio_extraction"]
}
```

---

## 🧪 Testing

### Test 1: Health Check
```bash
curl http://localhost:8003/health
```

### Test 2: Download Single Video
```bash
curl -X POST http://localhost:8003/download-video \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "https://vimeo.com/123456789",
    "job_id": "test"
  }'
```

### Test 3: Full Scrape (Without Upload)
```bash
curl -X POST http://localhost:8003/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "source_url": "https://mistable.com/site/report/key/85276ccbe94c7588e720773dfdc33654/id/93d35d10659c38ebec18b0f65b88f799",
    "job_id": "test-001",
    "user_id": "4a6e4cb7-9fa4-4333-85b4-1ac440119167",
    "upload_to_supabase": false
  }'
```

### Test 4: Full Scrape (With Supabase Upload)
```bash
curl -X POST http://localhost:8003/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "source_url": "https://mistable.com/site/report/key/85276ccbe94c7588e720773dfdc33654/id/93d35d10659c38ebec18b0f65b88f799",
    "job_id": "test-002",
    "user_id": "4a6e4cb7-9fa4-4333-85b4-1ac440119167",
    "upload_to_supabase": true
  }'
```

---

## 🔗 Orchestrator Integration

### Update Orchestrator to Call Scraper

```python
# services/orchestrator/app.py

SCRAPER_URL = os.environ.get("SCRAPER_URL", "http://scraper:8003")

@app.route('/v1/jobs/new', methods=['POST'])
def start_new_job():
    # ... existing code ...
    
    if source_url:
        # New workflow: miStable URL
        job = db.create_job(
            user_id=user_id,
            source_url=source_url,
            trainer_logo_url=trainer_logo_url,
            system_prompt=system_prompt
        )
        
        # Call scraper service
        scraper_response = requests.post(
            f"{SCRAPER_URL}/scrape",
            json={
                "source_url": source_url,
                "job_id": job['job_id'],
                "user_id": user_id,
                "upload_to_supabase": True
            },
            timeout=300  # 5 minutes for video download
        )
        
        if scraper_response.status_code == 200:
            result = scraper_response.json()
            
            # Update job with scraped media
            db.update_media_paths(
                job_id=job['job_id'],
                raw_mp4_path=result['uploaded_urls']['video_urls'][0],
                raw_mp3_path=result['uploaded_urls']['audio_urls'][0]
            )
            
            # Update trainer logo if found
            if result['metadata']['trainer_logo_url']:
                db.update_trainer_logo(
                    job_id=job['job_id'],
                    trainer_logo_url=result['metadata']['trainer_logo_url']
                )
            
            # Update status to TRANSCRIBING
            db.update_status(job['job_id'], 'TRANSCRIBING')
            
            # Trigger transcription
            # ... call transcriber with MP3 URL ...
```

---

## 📊 Performance Expectations

### Processing Times
- **HTML Fetch & Parse**: <1 second
- **Video Download**: 10-60 seconds (depends on size)
- **Audio Extraction**: 2-5 seconds per video
- **Supabase Upload**: 5-15 seconds
- **Total**: ~20-80 seconds per video

### Resource Usage
- **CPU**: Moderate (yt-dlp, FFmpeg)
- **Memory**: ~500MB-1GB
- **Disk**: Temporary (auto-cleanup)
- **Network**: High during download

---

## 🎯 Key Features

### Robust Video Download
- ✅ Handles Vimeo embed-only videos
- ✅ Selects best quality automatically
- ✅ Handles segmented videos
- ✅ Graceful error handling

### Optimized Audio Extraction
- ✅ 16kHz sample rate (Whisper optimal)
- ✅ Mono audio (reduces size)
- ✅ High quality preservation
- ✅ Fast FFmpeg processing

### Intelligent HTML Parsing
- ✅ Extracts trainer logo
- ✅ Finds all Vimeo embeds
- ✅ Extracts horse/trainer names
- ✅ Captures report text
- ✅ Graceful fallbacks

### Clean Architecture
- ✅ Automatic temp file cleanup
- ✅ Error recovery
- ✅ Modular design
- ✅ Well-documented

---

## 🔧 Configuration

### Environment Variables
```bash
# In .env file
SCRAPER_URL=http://scraper:8003
SUPABASE_URL=https://coqtijrftaklcwgbnqef.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### Docker Compose
```yaml
scraper:
  build: ./services/scraper
  container_name: mistable_scraper
  restart: unless-stopped
  environment:
    - SUPABASE_URL=${SUPABASE_URL}
    - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
  ports:
    - "8003:8003"
  volumes:
    - /tmp/scraper_temp:/tmp:rw
```

---

## 📦 Dependencies

### Python Packages
```
flask==3.0.0
gunicorn==23.0.0
requests==2.31.0
beautifulsoup4==4.12.2
lxml==4.9.3
yt-dlp==2023.12.30
ffmpeg-python==0.2.0
supabase==2.3.0
python-dotenv==1.0.0
```

### System Dependencies
- **FFmpeg**: Installed in Docker container
- **Python 3.11**: Base image

---

## 🎉 What This Completes

### Full Automation Pipeline
```
miStable URL → Scraper → Transcriber → Enrichment → LLM Refiner → "Gold Standard"
```

### All 5 Microservices
1. ✅ **Orchestrator** (8080) - Workflow controller
2. ✅ **Transcriber** (8000) - GPU - Whisper transcription
3. ✅ **Scraper** (8003) - CPU - Video download & audio extraction
4. ✅ **Enrichment** (8002) - CPU - Layer 1 Brand Compliance
5. ✅ **LLM Refiner** (8001) - GPU - Layer 2 Brand Bible

### Complete Feature Set
- ✅ miStable report ingestion
- ✅ Video download and storage
- ✅ Audio extraction for transcription
- ✅ Metadata extraction (logo, names)
- ✅ Supabase Storage integration
- ✅ Brand Bible compliance (2 layers)
- ✅ "Gold Standard" output generation

---

## 🚀 Next Steps

### 1. Deploy Scraper Service
```bash
docker compose build scraper
docker compose up -d scraper
```

### 2. Test Health Check
```bash
curl http://localhost:8003/health
```

### 3. Test with Real miStable URL
```bash
curl -X POST http://localhost:8003/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "source_url": "https://mistable.com/site/report/key/85276ccbe94c7588e720773dfdc33654/id/93d35d10659c38ebec18b0f65b88f799",
    "job_id": "test-scraper-001",
    "user_id": "4a6e4cb7-9fa4-4333-85b4-1ac440119167",
    "upload_to_supabase": false
  }'
```

### 4. Integrate with Orchestrator
- Update orchestrator to call scraper
- Handle scraper response
- Update job with media paths
- Trigger transcription workflow

---

## 📖 Documentation

- **Service README**: `services/scraper/README.md`
- **API Endpoints**: Documented in README
- **Integration Guide**: This file
- **Architecture**: `ARCHITECTURE.md`

---

**Status**: ✅ Ready for deployment  
**Final Piece**: Complete automation pipeline  
**Action**: Build and test scraper service

---

*The Scraper microservice completes the Evolution Studios Engine - full automation from miStable URL to "Gold Standard" output* 🎬✨
