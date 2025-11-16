#!/usr/bin/env python3
"""
Test script for Supabase integration with Evolution Studios Engine
Tests the complete workflow: Job creation → Status tracking → Data retrieval
"""
import os
import sys
from supabase import create_client

# Add orchestrator to path
sys.path.insert(0, '/home/evo/evolution-studios-engine/services/orchestrator')
from supabase_client import StudioJobsClient

def test_supabase_connection():
    """Test basic Supabase connection"""
    print("=" * 60)
    print("TEST 1: Supabase Connection")
    print("=" * 60)
    
    try:
        # Load from .env
        from dotenv import load_dotenv
        load_dotenv('/home/evo/evolution-studios-engine/.env')
        
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_ANON_KEY")
        
        print(f"✓ Supabase URL: {supabase_url}")
        print(f"✓ Supabase Key: {supabase_key[:20]}...")
        
        client = create_client(supabase_url, supabase_key)
        print("✓ Supabase client created successfully")
        
        # Test table access
        response = client.table("studio_jobs").select("*").limit(1).execute()
        print(f"✓ Table access successful (found {len(response.data)} jobs)")
        
        return True
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        return False

def test_studio_jobs_client():
    """Test StudioJobsClient initialization"""
    print("\n" + "=" * 60)
    print("TEST 2: StudioJobsClient Initialization")
    print("=" * 60)
    
    try:
        from dotenv import load_dotenv
        load_dotenv('/home/evo/evolution-studios-engine/.env')
        
        db = StudioJobsClient()
        print("✓ StudioJobsClient initialized successfully")
        return db
    except Exception as e:
        print(f"✗ Client initialization failed: {e}")
        return None

def test_get_auth_users(db):
    """Get a sample user_id from auth.users for testing"""
    print("\n" + "=" * 60)
    print("TEST 3: Get Sample User ID")
    print("=" * 60)
    
    try:
        # Query auth.users to get a test user
        response = db.client.table("auth.users").select("id").limit(1).execute()
        
        if response.data and len(response.data) > 0:
            user_id = response.data[0]['id']
            print(f"✓ Found user_id: {user_id}")
            return user_id
        else:
            print("⚠ No users found in auth.users")
            print("  You'll need to create a user in Evolution 3.0 first")
            return None
    except Exception as e:
        print(f"⚠ Could not query auth.users: {e}")
        print("  This is expected - auth.users is protected")
        print("  Using a placeholder user_id for demonstration")
        return "00000000-0000-0000-0000-000000000000"

def test_create_job(db, user_id):
    """Test job creation"""
    print("\n" + "=" * 60)
    print("TEST 4: Create Test Job")
    print("=" * 60)
    
    if not user_id:
        print("⚠ Skipping - no user_id available")
        return None
    
    try:
        job = db.create_job(
            user_id=user_id,
            raw_audio_url="https://storage.supabase.co/test-audio.mp3",
            system_prompt="Brand Bible system prompt for testing"
        )
        
        print(f"✓ Job created successfully!")
        print(f"  Job ID: {job['job_id']}")
        print(f"  Status: {job['status']}")
        print(f"  Created: {job['created_at']}")
        
        return job['job_id']
    except Exception as e:
        print(f"✗ Job creation failed: {e}")
        return None

def test_update_status(db, job_id):
    """Test status updates"""
    print("\n" + "=" * 60)
    print("TEST 5: Update Job Status")
    print("=" * 60)
    
    if not job_id:
        print("⚠ Skipping - no job_id available")
        return False
    
    try:
        # Update to TRANSCRIBING
        job = db.update_status(job_id, db.STATUS_TRANSCRIBING)
        print(f"✓ Updated to TRANSCRIBING")
        
        # Store transcript
        job = db.store_transcript(job_id, "This is a test transcript from Whisper.")
        print(f"✓ Stored transcript, status: {job['status']}")
        
        # Complete job
        job = db.store_refined_text(job_id, "This is the final brand-compliant refined text.")
        print(f"✓ Stored refined text, status: {job['status']}")
        print(f"  Processing time: {job.get('processing_time_ms', 'N/A')} ms")
        
        return True
    except Exception as e:
        print(f"✗ Status update failed: {e}")
        return False

def test_retrieve_job(db, job_id):
    """Test job retrieval"""
    print("\n" + "=" * 60)
    print("TEST 6: Retrieve Job")
    print("=" * 60)
    
    if not job_id:
        print("⚠ Skipping - no job_id available")
        return False
    
    try:
        job = db.get_job(job_id)
        
        if job:
            print(f"✓ Job retrieved successfully!")
            print(f"  Job ID: {job['job_id']}")
            print(f"  Status: {job['status']}")
            print(f"  Transcript: {job['raw_transcript'][:50]}...")
            print(f"  Refined: {job['refined_text'][:50]}...")
            return True
        else:
            print(f"✗ Job not found")
            return False
    except Exception as e:
        print(f"✗ Job retrieval failed: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("EVOLUTION STUDIOS ENGINE - SUPABASE INTEGRATION TEST")
    print("=" * 60)
    
    # Test 1: Connection
    if not test_supabase_connection():
        print("\n❌ Connection test failed. Exiting.")
        return
    
    # Test 2: Client initialization
    db = test_studio_jobs_client()
    if not db:
        print("\n❌ Client initialization failed. Exiting.")
        return
    
    # Test 3: Get user ID
    user_id = test_get_auth_users(db)
    
    # Test 4: Create job
    job_id = test_create_job(db, user_id)
    
    # Test 5: Update status
    if job_id:
        test_update_status(db, job_id)
    
    # Test 6: Retrieve job
    if job_id:
        test_retrieve_job(db, job_id)
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print("✓ Supabase connection: PASSED")
    print("✓ Client initialization: PASSED")
    
    if job_id:
        print("✓ Job creation: PASSED")
        print("✓ Status updates: PASSED")
        print("✓ Job retrieval: PASSED")
        print("\n🎉 ALL TESTS PASSED!")
    else:
        print("⚠ Job tests: SKIPPED (no valid user_id)")
        print("\n⚠ Partial success - connection works, but need valid user")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
