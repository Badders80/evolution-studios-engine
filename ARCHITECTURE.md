# Evolution Studios Engine - Architecture Documentation

## Overview

The Evolution Studios Engine is a microservices-based pipeline for processing audio content into brand-compliant, investor-ready text. It implements a two-layer Brand Bible compliance system aligned with the Evolution Stables brand identity.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Evolution 3.0 Frontend                      │
│                    (Next.js/Vercel/Supabase)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Orchestrator (Port 8080)                      │
│                        CPU-Bound Service                        │
│  - Job management & workflow coordination                       │
│  - Supabase integration (studio_jobs table)                     │
│  - Status tracking: NEW → TRANSCRIBING → ENRICHING → REFINING  │
└────────────┬────────────────────────────────────┬───────────────┘
             │                                    │
             ▼                                    │
┌─────────────────────────────┐                  │
│  Transcriber (Port 8000)    │                  │
│     GPU-Bound Service       │                  │
│  - Faster-Whisper medium.en │                  │
│  - Audio → Raw Transcript   │                  │
│  - RTX 3060 CUDA            │                  │
└────────────┬────────────────┘                  │
             │                                    │
             ▼                                    │
┌─────────────────────────────────────────────────────────────────┐
│              Enrichment Service (Port 8002)                     │
│                    CPU-Bound Service                            │
│  LAYER 1: Brand Compliance                                      │
│  - Jargon removal (regex-based)                                 │
│  - Banned phrase filtering                                      │
│  - Named Entity Recognition (spaCy)                             │
│  - Extracts: People, Organizations, Dates                       │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│              LLM Refiner (Port 8001)                            │
│                 GPU-Bound Service                               │
│  LAYER 2: Brand Bible Polish                                    │
│  - Mistral 7B Instruct (4.1GB GGUF)                             │
│  - Comprehensive Brand Bible system prompt                      │
│  - Understated Authority tone enforcement                       │
│  - British English compliance                                   │
│  - Active voice transformation                                  │
│  - "Gold Standard" output generation                            │
└─────────────────────────────────────────────────────────────────┘
```

## Microservices

### 1. Orchestrator (CPU)
- **Port**: 8080
- **Technology**: Flask/Gunicorn
- **Purpose**: Workflow coordination and job management
- **Key Endpoints**:
  - `GET /health` - Health check
  - `POST /v1/jobs/new` - Create new processing job
- **Database**: Supabase `studio_jobs` table
- **Status Flow**: NEW → TRANSCRIBING → ENRICHING → REFINING → COMPLETE/FAILED

### 2. Transcriber (GPU)
- **Port**: 8000
- **Technology**: FastAPI + Faster-Whisper
- **Model**: Whisper `medium.en` (optimized for 12GB VRAM)
- **Purpose**: Audio-to-text transcription
- **Key Endpoints**:
  - `GET /health` - Health check with model status
  - `POST /transcribe` - Process audio file
- **GPU**: RTX 3060 (CUDA)

### 3. Enrichment Service (CPU)
- **Port**: 8002
- **Technology**: FastAPI + spaCy
- **Purpose**: Layer 1 Brand Compliance - Jargon removal and NER
- **Key Endpoints**:
  - `GET /health` - Health check
  - `POST /enrich` - Process raw transcript
- **Features**:
  - Regex-based jargon mapping
  - Banned phrase removal
  - Named Entity Recognition (people, organizations, dates)

### 4. LLM Refiner (GPU)
- **Port**: 8001
- **Technology**: FastAPI + llama-cpp-python
- **Model**: Mistral 7B Instruct (4.1GB GGUF)
- **Purpose**: Layer 2 Brand Compliance - Final polish
- **Key Endpoints**:
  - `GET /health` - Health check with model status
  - `POST /refine_text` - Apply Brand Bible transformation
- **GPU**: RTX 3060 (CUDA)
- **System Prompt**: Comprehensive Brand Bible-aligned prompt

## Brand Bible Compliance

### Two-Layer System

**Layer 1: Enrichment (CPU)**
- Fast, deterministic transformations
- Jargon mapping: "juice" → "fuel", "furlong" → "stretch"
- Banned phrase removal: "revolutionary", "game-changing", "disrupting"
- Entity extraction for context

**Layer 2: LLM Refiner (GPU)**
- Contextual understanding and transformation
- Tone enforcement: Understated Authority
- Voice: Declarative, confident, calm
- Language: British English
- Style: Clarity first, poetry second

### Brand Identity Principles

1. **Voice & Tone**: Understated Authority
   - Prove innovation, don't shout hype
   - Declarative, confident, calm

2. **Brand Essence**: Bridge between paddock (heritage) and protocol (innovation)

3. **Core Promise**: "Ownership, evolved. You are the benchmark."

4. **Six Mandates**:
   - Clarity First, Poetry Second
   - Use Active Voice
   - Replace Hype with Proof
   - Avoid Banned Language
   - Maintain Human, Relatable Tone
   - Always use British English

## Database Schema

### `studio_jobs` Table

Persistent memory for the Orchestrator, tracking complete workflow.

| Column | Type | Purpose |
|--------|------|---------|
| `job_id` | uuid | Unique job identifier |
| `created_at` | timestamp | Job creation time |
| `status` | text | Workflow status (NEW/TRANSCRIBING/ENRICHING/REFINING/COMPLETE/FAILED) |
| `user_id` | uuid | Authenticated user (for RLS) |
| `raw_audio_url` | text | Source audio file location |
| `raw_transcript` | text | Output from Transcriber |
| `refined_text` | text | "Gold Standard" final output |
| `system_prompt_used` | text | LLM prompt used |
| `processing_time_ms` | integer | Total processing time |
| `error_details` | jsonb | Error logs if failed |

**Security**: Row Level Security (RLS) enabled
- Users can only view/create/update their own jobs
- Aligns with Brand Bible emphasis on Trust and Regulated operation

## Technology Stack

### Core Technologies
- **Containerization**: Docker + Docker Compose
- **GPU Runtime**: NVIDIA Container Toolkit
- **Database**: Supabase (PostgreSQL)
- **API Framework**: FastAPI (Python)
- **Orchestration**: Flask (Python)

### AI/ML Models
- **Transcription**: Faster-Whisper (medium.en)
- **NER**: spaCy (en_core_web_sm)
- **LLM**: Mistral 7B Instruct (GGUF format via llama-cpp-python)

### Infrastructure
- **GPU**: NVIDIA RTX 3060 (12GB VRAM)
- **CUDA**: Version 12.3.2
- **OS**: Ubuntu 22.04 (WSL2)

## Deployment

### Prerequisites
1. NVIDIA GPU with CUDA support
2. Docker + Docker Compose
3. NVIDIA Container Toolkit
4. Supabase project

### Environment Variables

```bash
# Orchestrator
TRANSCRIPTION_URL=http://transcription:8000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Transcriber
WHISPER_MODEL=medium.en
COMPUTE_TYPE=int8

# LLM Refiner
MODEL_NAME=mistral-7b-finetune.gguf
N_GPU_LAYERS=-1
N_CTX=4096
```

### Build & Deploy

```bash
# Build all services
docker compose build

# Deploy all services
docker compose up -d

# Check status
docker ps

# Health checks
curl http://localhost:8080/health  # Orchestrator
curl http://localhost:8000/health  # Transcriber
curl http://localhost:8002/health  # Enrichment
curl http://localhost:8001/health  # LLM Refiner
```

## Performance Characteristics

### GPU Memory Allocation
- **Transcriber (Whisper medium.en)**: ~2-3GB VRAM
- **LLM Refiner (Mistral 7B)**: ~5-6GB VRAM
- **Total VRAM Usage**: ~7-9GB (fits comfortably in 12GB)

### Processing Times (Typical)
- **Transcription**: 1-5 seconds per minute of audio
- **Enrichment**: <100ms per transcript
- **LLM Refinement**: 2-5 seconds per transcript
- **Total Pipeline**: 3-10 seconds per minute of audio

### Scalability
- CPU services (Orchestrator, Enrichment): Horizontally scalable
- GPU services (Transcriber, Refiner): Limited by GPU availability
- Recommended: Queue system for high-volume processing

## API Examples

### Create New Job
```bash
curl -X POST http://localhost:8080/v1/jobs/new \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "test-001",
    "supabase_file_id": "audio-file.mp3"
  }'
```

### Test Enrichment
```bash
curl -X POST http://localhost:8002/enrich \
  -H "Content-Type: application/json" \
  -d '{
    "asset_id": "test-asset",
    "transcript": "Horse needs more juice in the final furlong."
  }'
```

### Test LLM Refiner
```bash
curl -X POST http://localhost:8001/refine_text \
  -H "Content-Type: application/json" \
  -d '{
    "raw_text": "Trainer reckons this will be a game-changer."
  }'
```

## Future Enhancements

### Phase 2
- [ ] Async job processing with Celery/Redis
- [ ] WebSocket support for real-time status updates
- [ ] Audio file upload directly to Orchestrator
- [ ] Batch processing support

### Phase 3
- [ ] Multi-language support
- [ ] Custom model fine-tuning on Evolution Stables data
- [ ] A/B testing framework for prompt optimization
- [ ] Analytics dashboard for job metrics

### Infrastructure
- [ ] Samsung 990 Pro SSD for I/O optimization
- [ ] Kubernetes deployment for production
- [ ] Auto-scaling based on queue depth
- [ ] Multi-GPU support for parallel processing

## Monitoring & Observability

### Health Checks
All services expose `/health` endpoints for monitoring.

### Metrics to Track
- Job processing time (stored in `processing_time_ms`)
- Success/failure rates by status
- GPU utilization (via `nvidia-smi`)
- Queue depth and wait times
- Model inference latency

### Logging
- Orchestrator: Job lifecycle events
- Services: Request/response logs
- Errors: Detailed error logs in `error_details` (jsonb)

## Security Considerations

1. **Row Level Security (RLS)**: User data isolation in Supabase
2. **Authentication**: JWT tokens from Supabase Auth
3. **Network**: Services communicate via internal Docker network
4. **API Keys**: Environment variables, never hardcoded
5. **CORS**: Configured for Evolution 3.0 frontend domain only

## Brand Alignment

This architecture embodies Evolution Stables' brand values:

- **Trust**: RLS ensures data privacy and security
- **Regulated**: Structured workflow with clear status tracking
- **Innovation**: GPU-accelerated AI pipeline
- **Heritage**: Respects racing terminology while making it accessible
- **Ownership, Evolved**: Users have full visibility and control

---

**Version**: 1.0  
**Last Updated**: November 8, 2025  
**Status**: Production-Ready (Sprint 1 MVP Complete)
