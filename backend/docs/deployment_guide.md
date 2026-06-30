# JanArogya Netra — Backend Operations & Deployment Guide

This operations manual details the project layout, environment configurations, backup routines, database indices tuning, and GitHub deployment pipelines.

---

## 1. Backend Folder Structure

The repository represents a standard, GitHub-ready Supabase backend structure:

```text
/backend
├── database/                   # Schema migrations & security configurations
│   ├── migrations/
│   │   ├── 00_init_schema.sql         # Base tables, indexes, and seeded permissions
│   │   ├── 01_rbac_and_triggers.sql  # Users mirroring and permission helpers
│   │   └── 04_healthcare_logic.sql    # Atomic supply transfers & outbreak notifications
│   │   └── 05_ai_modules.sql         # Dynamic prompts, AI logs, and context memory
│   └── policies/
│       ├── 02_rls_policies.sql       # Row Level Security geographical scoping
│       └── 03_storage_policies.sql   # Private buckets policies for storage.objects
├── docs/                       # System architecture and REST documentation
│   ├── api_documentation.md          # API contracts specifications
│   ├── database_schema.md            # Detailed schema layouts and permission matrix
│   └── deployment_guide.md           # This operations & deployment guide
├── functions/                  # Deno Edge Functions
│   ├── ai/
│   │   └── index.ts                  # Grounded assistant, outbreak monitor, health scores
│   ├── attendance/
│   │   └── index.ts                  # Check-in roster and staff registrations
│   ├── dashboard/
│   │   └── index.ts                  # Digital twin, timeline, and analytical dashboard metrics
│   ├── medicine/
│   │   └── index.ts                  # Inventory manager, transfer request, atomic approvals
│   ├── notifications/
│   │   └── index.ts                  # Lists notifications and flags read/unread
│   ├── patients/
│   │   └── index.ts                  # Registers patient files and logs clinic visits
│   ├── missions/
│   │   └── index.ts                  # Command missions, recommendations, and consolidated queue
│   └── reports/
│       └── index.ts                  # Reports engine compiling PDF/CSV formats
├── tests/                      # Automated test suite scripts
│   ├── api_tests.ts                  # API endpoint compliance tests
│   ├── security_tests.ts             # RLS boundary tests
│   └── load_tests.ts                 # Load simulation scripts
├── supabase/
│   └── config.toml                   # Local Supabase dev config
├── .env.example                # Example environment variables template
└── README.md                   # Repository introduction
```

---

## 2. Environment Variables Configuration

Create a secure `.env` file inside the root backend folder before deploying.

| Variable Name | Type | Purpose | Example Value |
| :--- | :---: | :--- | :--- |
| **`SUPABASE_URL`** | String | Direct Supabase Project API URL | `https://your-proj-id.supabase.co` |
| **`SUPABASE_ANON_KEY`**| String | Public anonymous key for REST queries | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| **`SUPABASE_SERVICE_ROLE_KEY`** | String | Service role key (bypasses RLS, secure only) | `eyJhbGciOiJIUzI1NiIsInR5...` |
| **`GEMINI_API_KEY`** | String | Google AI Gemini Studio key for LLM grounding | `AIzaSyCsW...` |
| **`ENV_STAGE`** | String | Target environment deployment target | `production` |

---

## 3. Supabase Deployment CLI Sequence

Deploy schema updates and edge functions using the Supabase CLI utility:

```bash
# 1. Login to Supabase account
supabase login

# 2. Initialize project link (requires database password)
supabase link --project-ref your-project-id

# 3. Apply schema migrations
supabase db push

# 4. Deploy Deno Edge Functions
supabase functions deploy ai --project-ref your-project-id
supabase functions deploy attendance --project-ref your-project-id
supabase functions deploy dashboard --project-ref your-project-id
supabase functions deploy medicine --project-ref your-project-id
supabase functions deploy notifications --project-ref your-project-id
supabase functions deploy patients --project-ref your-project-id
supabase functions deploy missions --project-ref your-project-id
supabase functions deploy reports --project-ref your-project-id

# 5. Set Environment secrets for Gemini on Edge Functions
supabase secrets set GEMINI_API_KEY=AIzaSyCsW... ENV_STAGE=production
```

---

## 4. Database Optimization Strategy

### Primary & Foreign Key Indexes
We have configured explicit indexes on all foreign key references (`district_id`, `block_id`, `phc_id`, etc.) to prevent slow sequential scans during geo-nested RLS lookups.

### Query Analysis
Use `EXPLAIN ANALYZE` inside Supabase SQL Editor to examine slow queries:
```sql
EXPLAIN ANALYZE 
SELECT * FROM public.v_medicine_shortages 
WHERE phc_id = 'your-phc-uuid';
```

---

## 5. Automated Backup Strategy

To prevent data loss in production, configure daily backup routines.

### Daily Backup Scripts (`pg_dump` cron)
Run daily backups utilizing `pg_dump` securely from an isolated backup node:
```bash
#!/bin/bash
# Backup script database target
DB_NAME="postgres"
DB_USER="postgres"
DB_HOST="db.your-proj-id.supabase.co"
DB_PORT="5432"
BACKUP_DIR="/var/backups/janarogya-netra"
DATE=$(date +%Y-%m-%d-%H%M)

# Execute Dump containing schema and data, excluding Supabase internal namespaces
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -F c -b -v \
  -n public -n storage \
  -f "$BACKUP_DIR/backup-$DATE.dump"

# Keep only last 14 days backups
find $BACKUP_DIR -type f -name "*.dump" -mtime +14 -delete
```

### Point-in-Time Recovery (PITR)
Enable **PITR** inside Supabase dashboard settings. Supabase writes continuous Write-Ahead Logs (WAL) allowing database state restore down to the exact second.

---

## 6. Performance Monitoring & Diagnostics

1.  **Supabase Database Health Dashboard**:
    *   Monitor CPU usage, RAM utilization, and active connections.
    *   Ensure connection pooling (`pgbouncer` port `6543`) is used in serverless/highly concurrent scenarios instead of direct connections (`5432`) to prevent connection exhaustion.
2.  **Edge Function Logs**:
    *   Review execution logs in Supabase Dashboard under `Edge Functions -> [function_name] -> Logs` to diagnose response latency issues and API failure rates.
    *   Verify prompt overhead token metrics via SQL analysis on the `public.ai_logs` table.
