"""
Supabase Client for Evolution Studios Engine
Handles database operations for the studio_jobs table
"""
import os
from typing import Optional, Dict, Any
from datetime import datetime
from supabase import create_client, Client

class StudioJobsClient:
    """
    Client for managing studio_jobs table operations
    Tracks workflow: Audio → Transcript → Enrichment → Refinement
    """
    
    # Job status constants
    STATUS_NEW = "NEW"
    STATUS_TRANSCRIBING = "TRANSCRIBING"
    STATUS_ENRICHING = "ENRICHING"
    STATUS_REFINING = "REFINING"
    STATUS_COMPLETE = "COMPLETE"
    STATUS_FAILED = "FAILED"
    
    def __init__(self):
        """
        Initialize Supabase client with service role key
        This allows the Orchestrator to create jobs on behalf of users (bypasses RLS)
        
        Requires environment variables:
        - SUPABASE_URL
        - SUPABASE_SERVICE_ROLE_KEY (for backend operations)
        """
        supabase_url = os.environ.get("SUPABASE_URL")
        # Use service role key for backend operations (bypasses RLS)
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required")
        
        self.client: Client = create_client(supabase_url, supabase_key)
        print(f"✓ Supabase client initialized with service role key")
    
    def create_job(
        self,
        user_id: str,
        raw_audio_url: str = None,
        system_prompt: str = None,
        source_url: str = None,
        raw_mp4_path: str = None,
        raw_mp3_path: str = None,
        trainer_logo_url: str = None
    ) -> Dict[str, Any]:
        """
        Create a new job in the studio_jobs table
        
        Args:
            user_id: UUID of the authenticated user
            raw_audio_url: URL/path to the raw audio file (legacy, optional)
            system_prompt: LLM system prompt to use (Brand Bible prompt)
            source_url: Original miStable report URL
            raw_mp4_path: Path to downloaded MP4 video in Supabase Storage
            raw_mp3_path: Path to extracted MP3 audio for transcription
            trainer_logo_url: URL to trainer logo from Brand Kit
        
        Returns:
            Dict containing the created job record
        """
        job_data = {
            "user_id": user_id,
            "status": self.STATUS_NEW
        }
        
        # Add optional fields if provided
        if raw_audio_url:
            job_data["raw_audio_url"] = raw_audio_url
        if system_prompt:
            job_data["system_prompt_used"] = system_prompt
        if source_url:
            job_data["source_url"] = source_url
        if raw_mp4_path:
            job_data["raw_mp4_path"] = raw_mp4_path
        if raw_mp3_path:
            job_data["raw_mp3_path"] = raw_mp3_path
        if trainer_logo_url:
            job_data["trainer_logo_url"] = trainer_logo_url
        
        response = self.client.table("studio_jobs").insert(job_data).execute()
        return response.data[0]
    
    def update_status(
        self,
        job_id: str,
        status: str,
        error_details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Update job status
        
        Args:
            job_id: UUID of the job
            status: New status (use STATUS_* constants)
            error_details: Optional error details if status is FAILED
        
        Returns:
            Dict containing the updated job record
        """
        update_data = {"status": status}
        
        if error_details and status == self.STATUS_FAILED:
            update_data["error_details"] = error_details
        
        response = self.client.table("studio_jobs").update(update_data).eq("job_id", job_id).execute()
        return response.data[0]
    
    def store_transcript(
        self,
        job_id: str,
        transcript: str
    ) -> Dict[str, Any]:
        """
        Store raw transcript and update status to ENRICHING
        
        Args:
            job_id: UUID of the job
            transcript: Raw transcript from Whisper
        
        Returns:
            Dict containing the updated job record
        """
        update_data = {
            "status": self.STATUS_ENRICHING,
            "raw_transcript": transcript
        }
        
        response = self.client.table("studio_jobs").update(update_data).eq("job_id", job_id).execute()
        return response.data[0]
    
    def store_refined_text(
        self,
        job_id: str,
        refined_text: str
    ) -> Dict[str, Any]:
        """
        Store final refined text and mark job as COMPLETE
        This is the "Gold Standard" brand-compliant output
        
        Args:
            job_id: UUID of the job
            refined_text: Final brand-compliant text from LLM Refiner
        
        Returns:
            Dict containing the completed job record
        """
        update_data = {
            "status": self.STATUS_COMPLETE,
            "refined_text": refined_text
        }
        
        response = self.client.table("studio_jobs").update(update_data).eq("job_id", job_id).execute()
        return response.data[0]
    
    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a job by ID
        
        Args:
            job_id: UUID of the job
        
        Returns:
            Dict containing the job record, or None if not found
        """
        response = self.client.table("studio_jobs").select("*").eq("job_id", job_id).execute()
        return response.data[0] if response.data else None
    
    def get_user_jobs(
        self,
        user_id: str,
        limit: int = 50,
        status_filter: Optional[str] = None
    ) -> list[Dict[str, Any]]:
        """
        Retrieve all jobs for a specific user
        
        Args:
            user_id: UUID of the user
            limit: Maximum number of jobs to return
            status_filter: Optional status filter (e.g., "COMPLETE")
        
        Returns:
            List of job records
        """
        query = self.client.table("studio_jobs").select("*").eq("user_id", user_id)
        
        if status_filter:
            query = query.eq("status", status_filter)
        
        response = query.order("created_at", desc=True).limit(limit).execute()
        return response.data
    
    def list_jobs(self, user_id: str) -> list[Dict[str, Any]]:
        """
        Alias for get_user_jobs for API consistency
        """
        return self.get_user_jobs(user_id)
    
    def update_media_paths(
        self,
        job_id: str,
        raw_mp4_path: str = None,
        raw_mp3_path: str = None
    ) -> Dict[str, Any]:
        """
        Update media file paths after download/extraction
        
        Args:
            job_id: UUID of the job
            raw_mp4_path: Path to downloaded MP4 video
            raw_mp3_path: Path to extracted MP3 audio
        
        Returns:
            Dict containing the updated job record
        """
        update_data = {}
        
        if raw_mp4_path:
            update_data["raw_mp4_path"] = raw_mp4_path
        if raw_mp3_path:
            update_data["raw_mp3_path"] = raw_mp3_path
        
        if not update_data:
            raise ValueError("At least one media path must be provided")
        
        response = self.client.table("studio_jobs").update(update_data).eq("job_id", job_id).execute()
        return response.data[0]
    
    def update_trainer_logo(
        self,
        job_id: str,
        trainer_logo_url: str
    ) -> Dict[str, Any]:
        """
        Update trainer logo URL from Brand Kit
        
        Args:
            job_id: UUID of the job
            trainer_logo_url: URL to trainer logo
        
        Returns:
            Dict containing the updated job record
        """
        update_data = {"trainer_logo_url": trainer_logo_url}
        
        response = self.client.table("studio_jobs").update(update_data).eq("job_id", job_id).execute()
        return response.data[0]
    
    def mark_failed(
        self,
        job_id: str,
        error_message: str,
        error_details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Mark a job as failed with error details
        
        Args:
            job_id: UUID of the job
            error_message: Human-readable error message
            error_details: Optional detailed error information
        
        Returns:
            Dict containing the updated job record
        """
        error_data = {
            "message": error_message,
            "timestamp": datetime.utcnow().isoformat(),
            **(error_details or {})
        }
        
        return self.update_status(job_id, self.STATUS_FAILED, error_data)
