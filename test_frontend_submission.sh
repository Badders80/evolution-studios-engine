#!/bin/bash

# Test Evolution Studios Frontend → Orchestrator Integration
# This simulates what the UrlSubmissionForm does

echo "🎬 Testing Evolution Studios Engine - End-to-End"
echo "================================================"
echo ""

# Test URL from miStable
SOURCE_URL="https://mistable.com/site/report/key/85276ccbe94c7588e720773dfdc33654/id/93d35d10659c38ebec18b0f65b88f799"
USER_ID="4a6e4cb7-9fa4-4333-85b4-1ac440119167"

echo "📋 Test Parameters:"
echo "  Source URL: $SOURCE_URL"
echo "  User ID: $USER_ID"
echo ""

echo "🔍 Step 1: Check Orchestrator Health"
HEALTH=$(curl -s http://localhost:8080/health)
echo "  Response: $HEALTH"
echo ""

echo "🚀 Step 2: Submit Job to Orchestrator"
echo "  Endpoint: POST http://localhost:8080/v1/jobs/new"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:8080/v1/jobs/new \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"source_url\": \"$SOURCE_URL\"
  }")

echo "📦 Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Extract job_id if successful
JOB_ID=$(echo "$RESPONSE" | grep -o '"job_id":"[^"]*"' | cut -d'"' -f4)

if [ -n "$JOB_ID" ]; then
  echo "✅ SUCCESS! Job created with ID: $JOB_ID"
  echo ""
  echo "🔄 Step 3: Check Job Status"
  sleep 2
  STATUS=$(curl -s http://localhost:8080/v1/jobs/$JOB_ID)
  echo "$STATUS" | python3 -m json.tool 2>/dev/null || echo "$STATUS"
else
  echo "❌ FAILED: No job_id in response"
fi

echo ""
echo "================================================"
echo "Test complete!"
