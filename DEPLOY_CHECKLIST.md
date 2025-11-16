# 🚀 Supabase Deployment Checklist

## Step 1: Deploy Database Schema ⏳

### Action Required NOW:

1. **Open Supabase SQL Editor**
   - URL: https://supabase.com/dashboard/project/coqtijrftaklcwgbnqef/sql
   - Click "New Query"

2. **Copy the Deployment Script**
   ```bash
   cat database/migrations/DEPLOY_NOW.sql
   ```

3. **Paste and Execute**
   - Paste the entire SQL script into the editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - Wait for success message

4. **Verify Deployment**
   Run these queries in the SQL Editor:
   ```sql
   -- Should return empty result (table exists)
   SELECT * FROM studio_jobs LIMIT 1;
   
   -- Should show: studio_jobs | true
   SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'studio_jobs';
   
   -- Should show 3 policies
   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'studio_jobs';
   ```

---

## Step 2: Rebuild Orchestrator ⏳

After schema is deployed, run these commands:

```bash
# Navigate to project directory
cd /home/evo/evolution-studios-engine

# Rebuild orchestrator with Supabase client
docker compose build orchestrator

# Restart orchestrator
docker compose up -d orchestrator

# Wait for startup
sleep 5

# Check logs
docker logs evolution_api_orchestrator --tail 30
```

---

## Step 3: Verify Connection ⏳

Test that the orchestrator can connect to Supabase:

```bash
# Health check
curl http://localhost:8080/health

# Should return:
# {"compute":"cpu","service":"orchestrator","status":"ok"}
```

---

## Step 4: Test Job Creation ⏳

Create a test job to verify end-to-end functionality:

```bash
# Note: You'll need a valid user_id from auth.users
# Get user_id from Evolution 3.0 frontend or Supabase Dashboard

curl -X POST http://localhost:8080/v1/jobs/new \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "your-user-id-here",
    "job_id": "test-supabase-001",
    "supabase_file_id": "test-audio.mp3"
  }'
```

---

## Expected Results

### ✅ Schema Deployed
- Table `studio_jobs` exists
- RLS is enabled
- 3 policies created (SELECT, INSERT, UPDATE)
- Indexes created for performance
- Trigger for auto-calculating processing time

### ✅ Orchestrator Connected
- Supabase client initialized
- Environment variables loaded
- No connection errors in logs

### ✅ Job Creation Works
- Job record created in `studio_jobs` table
- Status set to "NEW"
- User isolation enforced by RLS

---

## Troubleshooting

### Issue: "relation 'studio_jobs' does not exist"
**Cause**: Schema not deployed  
**Fix**: Run Step 1 again

### Issue: "permission denied for table studio_jobs"
**Cause**: RLS policies not created  
**Fix**: Verify policies exist with verification query

### Issue: "violates foreign key constraint"
**Cause**: `user_id` doesn't exist in `auth.users`  
**Fix**: Use a valid user_id from Evolution 3.0

### Issue: Orchestrator won't start
**Cause**: Missing Supabase credentials  
**Fix**: Check `.env` file exists and has correct values

### Issue: "SUPABASE_URL environment variable required"
**Cause**: Environment variables not loaded  
**Fix**: Rebuild orchestrator: `docker compose build orchestrator`

---

## Current Status

- ✅ Schema SQL prepared: `database/migrations/DEPLOY_NOW.sql`
- ✅ Environment configured: `.env`
- ✅ Orchestrator code ready: `supabase_client.py`
- ✅ Docker configuration updated: `docker-compose.yml`
- ⏳ **WAITING**: Schema deployment to Supabase
- ⏳ **WAITING**: Orchestrator rebuild

---

## Quick Commands Reference

```bash
# View deployment script
cat database/migrations/DEPLOY_NOW.sql

# Check environment variables
cat .env

# Rebuild orchestrator
docker compose build orchestrator

# Restart orchestrator
docker compose up -d orchestrator

# View logs
docker logs evolution_api_orchestrator --tail 50

# Check all services
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Health check all services
echo "=== ORCHESTRATOR ===" && curl -s http://localhost:8080/health && \
echo -e "\n\n=== TRANSCRIBER ===" && curl -s http://localhost:8000/health && \
echo -e "\n\n=== ENRICHMENT ===" && curl -s http://localhost:8002/health && \
echo -e "\n\n=== LLM REFINER ===" && curl -s http://localhost:8001/health
```

---

## Next Actions

1. ⏳ **YOU**: Deploy schema to Supabase (Step 1)
2. ⏳ **ME**: Rebuild orchestrator after confirmation (Step 2)
3. ⏳ **WE**: Test end-to-end workflow (Steps 3-4)

---

**Ready to deploy!** 🚀
