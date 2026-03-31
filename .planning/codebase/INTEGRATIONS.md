# External Integrations

**Analysis Date:** 2025-01-24

## APIs & External Services

### Supabase (Primary Backend)

**Purpose:** Complete backend-as-a-service providing authentication, database, and realtime capabilities.

**SDK/Client:** `@supabase/supabase-js` ^2.99.2

**Client Setup (`src/supabase/client.ts`):**
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://example.supabase.co',
  supabaseAnonKey ?? 'public-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
```

**Required Environment Variables:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase public anonymous key

## Data Storage

### PostgreSQL (via Supabase)

**Database Types:** `src/supabase/database.types.ts`

**Tables:**
| Table | Purpose |
|-------|---------|
| `users` | Student/admin profiles with academic info |
| `candidates` | Election candidates |
| `elections` | Election definitions with eligibility |
| `election_candidates` | Many-to-many junction table |
| `votes` | Cast votes (one per user per election) |
| `audit_logs` | Action tracking/audit trail |

**Schema Location:** `supabase/schema.sql`

**Key Constraints:**
- Users linked to `auth.users` via foreign key
- Unique constraint on `(user_id, election_id)` in votes
- Course/year/section eligibility checks via stored function

### Database Functions (RPC)

**`cast_vote(p_user_id, p_election_id, p_candidate_id)`:**
```typescript
// Usage in src/services/vote.service.ts
const { error } = await supabase.rpc('cast_vote', {
  p_user_id: userId,
  p_election_id: electionId,
  p_candidate_id: candidateId,
});
```

Security checks performed:
- User eligibility (course/year/section match)
- Election time window validation
- Duplicate vote prevention
- Candidate-election relationship validation

**`is_admin(p_user_id)`:**
- Returns boolean for RLS policy checks
- Used to determine admin access

### Row Level Security (RLS)

All tables have RLS enabled with policies defined in `supabase/schema.sql`:

**Users:**
- Users can view/update own profile
- Admins can view/manage all users

**Elections/Candidates:**
- Authenticated users can read
- Only admins can create/update/delete

**Votes:**
- Users can read own votes
- Admins can read all votes (for results)

## Authentication & Identity

### Supabase Auth

**Provider:** Email/password authentication

**Implementation Location:** `src/services/auth.service.ts`

**Auth Functions:**

| Function | Purpose | File |
|----------|---------|------|
| `registerStudent()` | Create new student account | `src/services/auth.service.ts` |
| `signInStudent()` | Student email/password login | `src/services/auth.service.ts` |
| `signInAdmin()` | Admin email/password login | `src/services/auth.service.ts` |
| `signOut()` | Sign out current user | `src/services/auth.service.ts` |
| `getCurrentSession()` | Get active session | `src/services/auth.service.ts` |
| `onAuthChange()` | Subscribe to auth state changes | `src/services/auth.service.ts` |

**Registration Flow:**
```typescript
// 1. Create auth user
const { data: authData, error } = await supabase.auth.signUp({
  email: normalizedEmail,
  password,
});

// 2. Create profile in users table
const { error: profileError } = await supabase.from('users').insert({
  id: authData.user.id,
  email: normalizedEmail,
  full_name: data.fullName.trim(),
  // ... academic details
  role: 'student',
});

// 3. Log to audit_logs
await supabase.from('audit_logs').insert({
  action: 'user_registered',
  performed_by: authData.user.id,
  // ...
});
```

**Auth State Management:**
- Zustand store for client state (`src/store/authStore.ts`)
- Auth listener in `App.tsx` syncs Supabase auth state

**Session Handling (`src/App.tsx`):**
```typescript
const unsubscribe = onAuthChange(async (authUser) => {
  if (authUser) {
    const appUser = await resolveAuthenticatedUser(authUser);
    setUser(appUser);
  } else {
    setUser(null);
  }
});
```

**Role-Based Access:**
- `UserRoute` component for student routes (`src/components/layout/UserRoute`)
- `AdminRoute` component for admin routes (`src/components/layout/AdminRoute`)

## Data Mapping Layer

**Location:** `src/services/mappers.ts`

Maps Supabase row types to application types:

| Mapper | Source | Target |
|--------|--------|--------|
| `mapUser()` | `UserRow` | `AppUser` |
| `mapElection()` | `ElectionRow` | `Election` |
| `mapCandidate()` | `CandidateRow` | `Candidate` |
| `mapVote()` | `VoteRow` | `Vote` |
| `mapAuditLog()` | `AuditLogRow` | `AuditLog` |

**Pattern:**
```typescript
export function mapUser(row: UserRow): AppUser {
  return {
    uid: row.id,
    email: row.email,
    fullName: row.full_name,
    // ... camelCase conversion
  };
}
```

## Service Layer

**Location:** `src/services/`

| Service | File | Purpose |
|---------|------|---------|
| Auth | `auth.service.ts` | User authentication & profiles |
| Elections | `election.service.ts` | CRUD operations for elections |
| Candidates | `candidate.service.ts` | CRUD operations for candidates |
| Votes | `vote.service.ts` | Vote casting & results |
| Users | `user.service.ts` | User management |
| Supabase | `supabase.service.ts` | Error handling utilities |

**Error Handling Pattern (`src/services/supabase.service.ts`):**
```typescript
export function assertNoError(error: PostgrestError | null, fallback: string): void {
  if (error) {
    throw new Error(error.message || fallback);
  }
}
```

## Monitoring & Observability

**Error Tracking:**
- Console logging (no external service)
- `react-hot-toast` for user-facing error messages

**Audit Logging:**
- Internal `audit_logs` table tracks:
  - User registration
  - Profile updates
  - Election creation
  - Vote casting

**Logs Pattern:**
```typescript
await supabase.from('audit_logs').insert({
  action: 'vote_cast',
  performed_by: userId,
  target_id: electionId,
  metadata: { candidateId },
});
```

## CI/CD & Deployment

**Hosting:** Vercel (configured via `vercel.json`)

**Configuration:**
```json
// vercel.json - likely contains SPA rewrite rules
```

**CI Pipeline:** Not detected (no GitHub Actions, etc.)

## Cryptographic Operations

**Location:** `src/lib/crypto.ts`

**Receipt Hash Generation:**
```typescript
export async function generateReceiptHash(
  voterId: string,
  electionId: string,
  candidateId: string
): Promise<string> {
  const raw = `${voterId}:${electionId}:${candidateId}:${Date.now()}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
```

Uses Web Crypto API (browser native).

## Webhooks & Callbacks

**Incoming:** None detected

**Outgoing:** None detected

## Third-Party Services Summary

| Service | Purpose | Required Setup |
|---------|---------|----------------|
| Supabase | Auth + Database + RLS | Environment variables |
| Vercel | Hosting | `vercel.json` config |

## Integration Checklist for New Developers

1. **Create Supabase Project:**
   - Set up new project at supabase.com
   - Run `supabase/schema.sql` to create tables
   - Configure RLS policies (included in schema)

2. **Environment Setup:**
   ```bash
   # Create .env.local
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Create Admin User:**
   - Follow `ADMIN_SETUP_GUIDE.md` or `supabase/setup_admin.sql`

4. **Deploy:**
   - Connect to Vercel
   - Set environment variables in Vercel dashboard

---

*Integration audit: 2025-01-24*
