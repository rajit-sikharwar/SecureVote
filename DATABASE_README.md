# SecureVote - Database Setup Guide

The database has been consolidated into **2 clean SQL files**.

## Files

1. **`users.sql`** - Core user/voting schema
2. **`admin.sql`** - Admin functions and audit

## Setup (Run in Order)

```sql
-- 1. Run users.sql first (creates tables + voting logic)
-- 2. Run admin.sql second (adds admin functions)
```

## What's Included

**users.sql:**
- Tables: users, candidates, elections, election_candidates, votes
- Functions: is_admin(), cast_vote()
- RLS policies + indexes

**admin.sql:**
- Tables: audit_logs
- Functions: get_election_results(), get_election_vote_count(), get_total_vote_count()
- Admin management: create_admin_user(), deactivate_user(), clear_all_sessions()
- Default admin: admin@securevote.com

## Verify

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
```

Expected: audit_logs, candidates, election_candidates, elections, users, votes

---
*Version 1.0 | 2026-03-31*
