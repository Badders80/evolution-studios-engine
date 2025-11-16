#!/bin/bash

# Create Supabase Storage Buckets via API
# This is a workaround if SQL bucket creation didn't work

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://your-project.supabase.co}"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

echo "Creating Supabase Storage buckets..."
echo "URL: $SUPABASE_URL"

# Create videos bucket
echo "Creating 'videos' bucket..."
curl -X POST "${SUPABASE_URL}/storage/v1/bucket" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "videos",
    "name": "videos",
    "public": true,
    "file_size_limit": 524288000,
    "allowed_mime_types": ["video/*"]
  }'

echo ""

# Create audio bucket
echo "Creating 'audio' bucket..."
curl -X POST "${SUPABASE_URL}/storage/v1/bucket" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "audio",
    "name": "audio",
    "public": true,
    "file_size_limit": 104857600,
    "allowed_mime_types": ["audio/*"]
  }'

echo ""
echo "Done! Buckets created."
