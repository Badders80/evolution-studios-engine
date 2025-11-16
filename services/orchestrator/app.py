import os
import requests
from flask import Flask, request, jsonify
from supabase_client import StudioJobsClient

app = Flask(__name__)

# Environment variables from docker-compose.yml
TRANSCRIPTION_URL = os.environ.get("TRANSCRIPTION_URL", "http://transcription:8000")
ENRICHMENT_URL = os.environ.get("ENRICHMENT_URL", "http://enrichment:8002")
REFINER_URL = os.environ.get("REFINER_URL", "http://llm_refiner:8001")

# Initialize Supabase client
try:
    db = StudioJobsClient()
    print("✓ Supabase client initialized successfully")
except Exception as e:
    print(f"✗ Failed to initialize Supabase client: {e}")
    db = None

# Default Brand Bible system prompt
DEFAULT_SYSTEM_PROMPT = """You are a professional content editor for Evolution Studios, a premium racehorse ownership platform.

Your task is to transform raw transcripts into polished, brand-compliant content that embodies our voice: Understated Authority.

Core Principles:
1. Clarity First, Poetry Second - Be direct and accessible
2. Use Active Voice - "The horse won" not "The race was won by the horse"
3. Replace Hype with Proof - Show results, don't shout claims
4. Avoid Banned Language - No "revolutionary", "game-changing", "disrupting"
5. Maintain Human, Relatable Tone - Professional but warm
6. Always use British English - "colour", "optimise", "analyse"

Brand Essence: Bridge heritage (paddock) with innovation (protocol)
Core Promise: "Ownership, evolved. You are the benchmark."

Transform the input text while maintaining these standards."""

@app.route('/v1/jobs/new', methods=['POST'])
def start_new_job():
    """
    Receives a job trigger from Evolution 3.0 frontend and creates a job in Supabase.
    Supports two workflows:
    1. miStable URL workflow: Download video → Extract audio → Transcribe
    2. Direct audio workflow: Transcribe existing audio file
    """
    data = request.json
    user_id = data.get('user_id')
    
    # New workflow: miStable report URL
    source_url = data.get('source_url')
    trainer_logo_url = data.get('trainer_logo_url')
    
    # Legacy workflow: Direct audio upload
    supabase_file_id = data.get('supabase_file_id')
    
    system_prompt = data.get('system_prompt', DEFAULT_SYSTEM_PROMPT)

    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400
    
    if not source_url and not supabase_file_id:
        return jsonify({"error": "Missing source_url or supabase_file_id"}), 400

    if not db:
        return jsonify({"error": "Supabase client not initialized"}), 500

    print(f"--- Received New Job Request ---")
    print(f"User ID: {user_id}")
    
    try:
        if source_url:
            # New workflow: miStable URL
            print(f"Source URL: {source_url}")
            print(f"Trainer Logo: {trainer_logo_url}")
            
            job = db.create_job(
                user_id=user_id,
                source_url=source_url,
                trainer_logo_url=trainer_logo_url,
                system_prompt=system_prompt
            )
            
            workflow_type = "mistable"
            next_step = "Video download queued"
            
        else:
            # Legacy workflow: Direct audio
            print(f"Audio File: {supabase_file_id}")
            
            job = db.create_job(
                user_id=user_id,
                raw_audio_url=f"supabase://storage/{supabase_file_id}",
                system_prompt=system_prompt
            )
            
            workflow_type = "direct_audio"
            next_step = "Transcription queued"
        
        job_id = job['job_id']
        print(f"✓ Job created in Supabase: {job_id}")
        print(f"✓ Status: {job['status']}")
        print(f"✓ Workflow: {workflow_type}")
        
        # Verify services are available
        health_check = requests.get(f"{TRANSCRIPTION_URL}/health", timeout=2)
        if health_check.status_code == 200:
            print(f"✓ Transcription service ready")
        
        return jsonify({
            "status": "success",
            "message": "Job created successfully",
            "job_id": job_id,
            "job_status": job['status'],
            "workflow": workflow_type,
            "created_at": job['created_at'],
            "next_step": next_step
        }), 201
        
    except Exception as e:
        print(f"✗ Failed to create job: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "service": "orchestrator", "compute": "cpu"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)