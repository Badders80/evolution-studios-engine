# 🔑 Service Role Key Required

## Issue

The Orchestrator is getting RLS (Row Level Security) policy violations when trying to create jobs on behalf of users.

**Error**: `new row violates row-level security policy for table "studio_jobs"`

## Root Cause

The Orchestrator is currently using the **anon key**, which enforces RLS policies as if it were an unauthenticated client. RLS policies check `auth.uid()`, which is `NULL` when using the anon key without a user session.

## Solution

The Orchestrator needs to use the **service role key** instead, which bypasses RLS and allows it to create jobs on behalf of any user.

### Service Role Key vs Anon Key

| Key Type | Use Case | RLS Enforcement |
|----------|----------|-----------------|
| **Anon Key** | Frontend clients, user sessions | ✅ Enforced |
| **Service Role Key** | Backend services, admin operations | ❌ Bypassed |

## How to Get Service Role Key

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/coqtijrftaklcwgbnqef/settings/api

2. **Find "service_role" key**
   - Under "Project API keys"
   - Look for the key labeled "service_role"
   - ⚠️ **This key has admin privileges - keep it secret!**

3. **Copy the service_role key**

## Update Configuration

### Option 1: Update .env file (Recommended)

Add a new environment variable:

```bash
# .env
SUPABASE_URL=https://coqtijrftaklcwgbnqef.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...  # Keep for reference
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # Add this - service role key
```

### Option 2: Separate Keys for Different Services

```bash
# .env
SUPABASE_URL=https://coqtijrftaklcwgbnqef.supabase.co

# For frontend/client-side (Evolution 3.0)
SUPABASE_ANON_KEY=eyJhbGci...

# For backend/server-side (Orchestrator)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

## Update Orchestrator Code

The `supabase_client.py` needs to use the service role key:

```python
def __init__(self):
    """
    Initialize Supabase client with service role key
    This allows the Orchestrator to create jobs on behalf of users
    """
    supabase_url = os.environ.get("SUPABASE_URL")
    # Use service role key for backend operations
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required")
    
    self.client: Client = create_client(supabase_url, supabase_key)
```

## Security Considerations

### ⚠️ Service Role Key is Powerful

The service role key:
- ✅ Bypasses all RLS policies
- ✅ Can read/write any data
- ✅ Can perform admin operations
- ❌ Should NEVER be exposed to frontend
- ❌ Should NEVER be committed to git

### ✅ Safe Usage

- ✅ Use in backend services only (Orchestrator)
- ✅ Store in environment variables
- ✅ Add `.env` to `.gitignore`
- ✅ Rotate periodically
- ✅ Monitor usage in Supabase logs

### ❌ Unsafe Usage

- ❌ Never use in frontend code
- ❌ Never commit to version control
- ❌ Never share publicly
- ❌ Never log the full key

## Why This is Correct Architecture

The Orchestrator acts as a **trusted backend service** that:

1. Receives authenticated requests from Evolution 3.0 frontend
2. Validates the user_id
3. Creates jobs on behalf of the user
4. Updates job status as processing progresses

This is similar to how:
- Stripe creates charges on behalf of users
- SendGrid sends emails on behalf of users
- AWS Lambda executes functions on behalf of users

The RLS policies still protect the data because:
- Frontend uses anon key (RLS enforced)
- Users can only read their own jobs via frontend
- Orchestrator uses service role key (trusted backend)
- Orchestrator validates user_id before creating jobs

## Next Steps

1. ⏳ Get service role key from Supabase Dashboard
2. ⏳ Add to `.env` file as `SUPABASE_SERVICE_ROLE_KEY`
3. ⏳ Update `supabase_client.py` to use service role key
4. ⏳ Update `docker-compose.yml` to pass the new env var
5. ⏳ Rebuild and restart orchestrator
6. ⏳ Test job creation again

---

**Status**: Waiting for service role key  
**Blocker**: RLS policy preventing job creation  
**Solution**: Use service role key for backend operations
