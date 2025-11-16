"""
Scraper Microservice API
Handles miStable report scraping and media processing
"""
import os
from flask import Flask, request, jsonify
from scraper_service import MiStableScraper, SupabaseUploader
from supabase import create_client

app = Flask(__name__)

# Initialize Supabase client (optional - for direct upload)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase_client = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print("✓ Supabase client initialized")
    except Exception as e:
        print(f"✗ Failed to initialize Supabase client: {e}")


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "service": "scraper",
        "compute": "cpu",
        "capabilities": ["html_parsing", "video_download", "audio_extraction"]
    })


@app.route('/scrape', methods=['POST'])
def scrape_report():
    """
    Scrape miStable report and extract media
    
    Request JSON:
    {
        "source_url": "https://mistable.com/site/report/...",
        "job_id": "uuid",
        "user_id": "uuid",
        "upload_to_supabase": true/false
    }
    
    Response JSON:
    {
        "success": true,
        "job_id": "uuid",
        "metadata": {...},
        "video_files": [...],
        "audio_files": [...],
        "uploaded_urls": {...}  // if upload_to_supabase=true
    }
    """
    data = request.json
    
    source_url = data.get('source_url')
    job_id = data.get('job_id')
    user_id = data.get('user_id')
    upload_to_supabase = data.get('upload_to_supabase', False)
    
    if not source_url or not job_id:
        return jsonify({
            "error": "Missing source_url or job_id"
        }), 400
    
    print(f"--- Scrape Request ---")
    print(f"Source URL: {source_url}")
    print(f"Job ID: {job_id}")
    print(f"Upload: {upload_to_supabase}")
    
    # Initialize scraper
    scraper = MiStableScraper()
    
    try:
        # Scrape report
        result = scraper.scrape_report(source_url, job_id)
        
        if not result['success']:
            return jsonify(result), 500
        
        # Upload to Supabase if requested
        uploaded_urls = None
        if upload_to_supabase and supabase_client and user_id:
            uploader = SupabaseUploader(supabase_client)
            uploaded_urls = uploader.upload_media(
                user_id=user_id,
                job_id=job_id,
                video_files=result['video_files'],
                audio_files=result['audio_files']
            )
            result['uploaded_urls'] = uploaded_urls
        
        # Clean up temp files
        scraper.cleanup()
        
        # Prepare response (remove temp_dir from response)
        response = {
            'success': True,
            'job_id': result['job_id'],
            'source_url': result['source_url'],
            'metadata': result['metadata'],
            'local_files': {
                'videos': result['video_files'],
                'audio': result['audio_files']
            }
        }
        
        if uploaded_urls:
            response['uploaded_urls'] = uploaded_urls
        
        return jsonify(response), 200
        
    except Exception as e:
        # Clean up on error
        try:
            scraper.cleanup()
        except:
            pass
        
        return jsonify({
            "success": False,
            "error": str(e),
            "job_id": job_id
        }), 500


@app.route('/download-video', methods=['POST'])
def download_video():
    """
    Download a single video (for testing)
    
    Request JSON:
    {
        "video_url": "https://vimeo.com/...",
        "job_id": "test"
    }
    """
    data = request.json
    
    video_url = data.get('video_url')
    job_id = data.get('job_id', 'test')
    
    if not video_url:
        return jsonify({"error": "Missing video_url"}), 400
    
    scraper = MiStableScraper()
    
    try:
        video_path = scraper._download_video(video_url, job_id, 1)
        
        if video_path:
            audio_path = scraper._extract_audio(video_path)
            
            result = {
                "success": True,
                "video_path": video_path,
                "audio_path": audio_path
            }
        else:
            result = {
                "success": False,
                "error": "Download failed"
            }
        
        scraper.cleanup()
        return jsonify(result)
        
    except Exception as e:
        scraper.cleanup()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/extract-audio', methods=['POST'])
def extract_audio():
    """
    Extract audio from video file (for testing)
    
    Request JSON:
    {
        "video_path": "/path/to/video.mp4"
    }
    """
    data = request.json
    
    video_path = data.get('video_path')
    
    if not video_path:
        return jsonify({"error": "Missing video_path"}), 400
    
    scraper = MiStableScraper()
    
    try:
        audio_path = scraper._extract_audio(video_path)
        
        if audio_path:
            result = {
                "success": True,
                "audio_path": audio_path
            }
        else:
            result = {
                "success": False,
                "error": "Extraction failed"
            }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8003)
