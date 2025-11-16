// Evolution Studios Engine - Type Definitions

export type JobStatus = 
  | 'NEW'
  | 'PENDING'
  | 'SCRAPING'
  | 'TRANSCRIBING'
  | 'ENRICHING'
  | 'REFINING'
  | 'COMPLETE'
  | 'COMPLETED'
  | 'FAILED';

export interface Job {
  job_id: string;
  user_id: string;
  status: JobStatus;
  source_url?: string;
  raw_mp4_path?: string;
  raw_mp3_path?: string;
  raw_audio_url?: string;
  trainer_logo_url?: string;
  raw_transcript?: string;
  enriched_transcript?: string;
  refined_text?: string; // Note: DB uses refined_text, not refined_transcript
  system_prompt_used?: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  error_details?: Record<string, unknown>;
  processing_time_ms?: number;
}

export interface CreateJobPayload {
  source_url: string;
  raw_audio_url?: string;
  trainer_logo_url?: string;
  system_prompt?: string;
}

export interface CreateJobResponse {
  job_id: string;
  status: string;
  message: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
}
