# 🎬 Scraper Microservice

## Overview

The Scraper microservice handles the complete workflow for processing miStable trainer reports:
1. **HTML Parsing** - Extract metadata, video URLs, and trainer information
2. **Video Download** - Download videos from Vimeo embeds using yt-dlp
3. **Audio Extraction** - Convert MP4 to MP3 using FFmpeg (optimized for Whisper)
4. **Supabase Upload** - Upload media files to Supabase Storage (optional)

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **HTML Parsing** | BeautifulSoup + lxml | Navigate HTML structure, extract metadata |
| **Video Download** | yt-dlp | Download from Vimeo (handles embeds, segments) |
| **Audio Extraction** | FFmpeg | Convert MP4 → MP3 (16kHz mono for Whisper) |
| **HTTP Server** | Flask + Gunicorn | REST API endpoints |
| **Storage** | Supabase Storage | Upload processed media files |

---

## Architecture

### CPU-Bound Service
- Runs on **Ryzen 5 7600x** (CPU only)
- Handles I/O-bound operations (network, file system)
- Keeps GPU free for AI models (Whisper, Mistral)

### Workflow

```
miStable Report URL
   ↓
1. Fetch HTML
   ↓
2. Parse & Extract:
   - Trainer logo URL
   - Vimeo video URLs
   - Horse name
   - Trainer name
   - Report text
   ↓
3. Download Videos (yt-dlp)
   - Best quality MP4
   - Saved to /tmp
   ↓
4. Extract Audio (FFmpeg)
   - 16kHz sample rate
   - Mono audio
   - High quality MP3
   ↓
5. Upload to Supabase (optional)
   - Videos → videos bucket
   - Audio → audio bucket
   ↓
6. Return metadata + file paths
   ↓
7. Cleanup temp files
```

---

## API Endpoints

### Health Check
```bash
GET /health
```

**Response**:
```json
{
  "status": "ok",
  "service": "scraper",
  "compute": "cpu",
  "capabilities": ["html_parsing", "video_download", "audio_extraction"]
}
```

---

### Scrape Report
```bash
POST /scrape
Content-Type: application/json

{
  "source_url": "https://mistable.com/site/report/key/XXX/id/YYY",
  "job_id": "uuid",
  "user_id": "uuid",
  "upload_to_supabase": true
}
```

**Response**:
```json
{
  "success": true,
  "job_id": "uuid",
  "source_url": "https://mistable.com/...",
  "metadata": {
    "trainer_logo_url": "https://...",
    "video_urls": ["https://vimeo.com/..."],
    "horse_name": "First Gear",
    "trainer_name": "Stephen Gray Racing",
    "report_text": "...",
    "video_count": 2
  },
  "local_files": {
    "videos": ["/tmp/job-uuid-video-1.mp4"],
    "audio": ["/tmp/job-uuid-video-1.mp3"]
  },
  "uploaded_urls": {
    "video_urls": ["https://storage.supabase.co/..."],
    "audio_urls": ["https://storage.supabase.co/..."]
  }
}
```

---

### Download Video (Testing)
```bash
POST /download-video
Content-Type: application/json

{
  "video_url": "https://vimeo.com/123456789",
  "job_id": "test"
}
```

**Response**:
```json
{
  "success": true,
  "video_path": "/tmp/test-video-1.mp4",
  "audio_path": "/tmp/test-video-1.mp3"
}
```

---

### Extract Audio (Testing)
```bash
POST /extract-audio
Content-Type: application/json

{
  "video_path": "/path/to/video.mp4"
}
```

**Response**:
```json
{
  "success": true,
  "audio_path": "/path/to/video.mp3"
}
```

---

## Configuration

### Environment Variables

```bash
# Supabase (optional - for direct upload)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
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

## FFmpeg Audio Settings

Optimized for Whisper transcription:

```python
ffmpeg.output(
    audio_path,
    **{
        'q:a': 0,      # Highest quality
        'map': 'a',    # Audio stream only
        'ar': 16000,   # 16kHz sample rate (Whisper optimal)
        'ac': 1        # Mono audio
    }
)
```

### Why These Settings?

- **16kHz sample rate**: Whisper's optimal input frequency
- **Mono audio**: Reduces file size, sufficient for speech
- **High quality**: Preserves speech clarity

---

## HTML Parsing Strategy

### Trainer Logo
1. Look for `<img>` with class containing "logo", "brand", or "trainer"
2. Fallback: Find `<img>` in header/banner section
3. Return `src` attribute

### Video URLs
1. Find all `<iframe>` elements
2. Filter by `src` containing "vimeo.com"
3. Normalize URLs (add https:// if needed)

### Horse Name
1. Extract from `<title>` tag (before "|")
2. Fallback: Extract from `<h1>` heading
3. Default: "Unknown Horse"

### Trainer Name
1. Extract from `<title>` tag (after "|")
2. Fallback: Search for text containing "trainer"
3. Default: "Unknown Trainer"

### Report Text
1. Find main content area (`<main>`, `<article>`, or div with "content" class)
2. Remove `<script>` and `<style>` tags
3. Extract text with newline separators
4. Clean up whitespace

---

## yt-dlp Configuration

```python
ydl_opts = {
    'format': 'best[ext=mp4]',  # Best quality MP4
    'outtmpl': output_template,  # Output filename pattern
    'quiet': False,              # Show progress
    'no_warnings': False,        # Show warnings
    'extract_flat': False,       # Full extraction
}
```

### Why yt-dlp?

- **Vimeo Support**: Handles embed-only videos
- **Quality Selection**: Downloads best available quality
- **Robust**: Handles segmented videos, authentication
- **Maintained**: Active development, frequent updates

---

## File Naming Convention

### Local Files (Temporary)
```
{job_id}-video-{index}.mp4
{job_id}-video-{index}.mp3
```

Example:
```
8cc74fc8-2d17-4a61-9187-810a86a8c700-video-1.mp4
8cc74fc8-2d17-4a61-9187-810a86a8c700-video-1.mp3
```

### Supabase Storage
```
{user_id}/{job_id}/video-{index}.mp4
{user_id}/{job_id}/audio-{index}.mp3
```

Example:
```
4a6e4cb7-9fa4-4333-85b4-1ac440119167/8cc74fc8.../video-1.mp4
4a6e4cb7-9fa4-4333-85b4-1ac440119167/8cc74fc8.../audio-1.mp3
```

---

## Error Handling

### Scraping Errors
- **Network timeout**: 30 second timeout for HTTP requests
- **Invalid HTML**: Graceful fallback to defaults
- **Missing elements**: Return None/empty values

### Download Errors
- **Video unavailable**: Skip video, continue with others
- **Download failure**: Log error, return None
- **Partial download**: yt-dlp handles resume

### Extraction Errors
- **FFmpeg error**: Log stderr, return None
- **Invalid video**: Skip extraction
- **Missing audio stream**: Log warning

### Cleanup
- Always cleanup temp directory
- Even on errors
- Prevents disk space issues

---

## Testing

### Test Health Check
```bash
curl http://localhost:8003/health
```

### Test Video Download
```bash
curl -X POST http://localhost:8003/download-video \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "https://vimeo.com/123456789",
    "job_id": "test"
  }'
```

### Test Full Scrape
```bash
curl -X POST http://localhost:8003/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "source_url": "https://mistable.com/site/report/key/XXX/id/YYY",
    "job_id": "test-001",
    "user_id": "4a6e4cb7-9fa4-4333-85b4-1ac440119167",
    "upload_to_supabase": false
  }'
```

---

## Performance

### Typical Processing Times
- **HTML Fetch**: <1 second
- **HTML Parse**: <100ms
- **Video Download**: 10-60 seconds (depends on size/network)
- **Audio Extraction**: 2-5 seconds per video
- **Supabase Upload**: 5-15 seconds (depends on size)

### Total Time
- **Single video**: ~20-80 seconds
- **Multiple videos**: Scales linearly

### Resource Usage
- **CPU**: Moderate (video download, FFmpeg)
- **Memory**: ~500MB-1GB
- **Disk**: Temporary (cleaned up after processing)
- **Network**: High during download

---

## Integration with Orchestrator

### Workflow

```python
# Orchestrator calls scraper
response = requests.post(
    f"{SCRAPER_URL}/scrape",
    json={
        "source_url": job['source_url'],
        "job_id": job['job_id'],
        "user_id": job['user_id'],
        "upload_to_supabase": True
    }
)

result = response.json()

# Update job with scraped data
db.update_media_paths(
    job_id=job['job_id'],
    raw_mp4_path=result['uploaded_urls']['video_urls'][0],
    raw_mp3_path=result['uploaded_urls']['audio_urls'][0]
)

db.update_trainer_logo(
    job_id=job['job_id'],
    trainer_logo_url=result['metadata']['trainer_logo_url']
)

# Trigger transcription with MP3
transcribe_audio(result['uploaded_urls']['audio_urls'][0])
```

---

## Dependencies

```txt
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
- **FFmpeg**: Required for audio extraction
- **Python 3.11**: Runtime environment

---

## Deployment

### Build
```bash
docker compose build scraper
```

### Start
```bash
docker compose up -d scraper
```

### Logs
```bash
docker logs mistable_scraper -f
```

### Health Check
```bash
curl http://localhost:8003/health
```

---

## Future Enhancements

### Phase 1
- [ ] Parallel video downloads
- [ ] Progress tracking/webhooks
- [ ] Retry logic for failed downloads
- [ ] Video quality selection

### Phase 2
- [ ] Thumbnail extraction
- [ ] Video metadata (duration, resolution)
- [ ] Subtitle extraction
- [ ] Multi-language support

### Phase 3
- [ ] Caching layer (Redis)
- [ ] Queue system (Celery)
- [ ] Batch processing
- [ ] Analytics/monitoring

---

**Status**: ✅ Ready for deployment  
**Compute**: CPU (Ryzen 5 7600x)  
**Port**: 8003  
**Dependencies**: FFmpeg, yt-dlp, BeautifulSoup

---

*Scraper microservice - The final piece of the Evolution Studios Engine content automation pipeline* 🎬
