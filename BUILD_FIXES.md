# 🔧 Build Fix Script for SecureVote

This script contains fixes for TypeScript build errors that occur before running the database migration.

## Quick Fix Commands

Run these commands to fix the build errors temporarily:

```bash
# 1. Fix unused variables in AddCandidate
sed -i 's/const watchedCourse = watch/\/\/ const watchedCourse = watch/' src/pages/admin/AddCandidate.tsx

# 2. Fix unused variables in CreateElection
sed -i 's/const \[selectedYear/\/\/ const [selectedYear/' src/pages/admin/CreateElection.tsx
sed -i 's/const \[selectedSection/\/\/ const [selectedSection/' src/pages/admin/CreateElection.tsx

# 3. Fix unused variables in StudentRegistration
sed -i 's/const watchedCourse = watch/\/\/ const watchedCourse = watch/' src/pages/StudentRegistration.tsx

# 4. Fix unused imports in Candidates
sed -i 's/import type { Candidate, Course, Section }/import type { Candidate }/' src/pages/admin/Candidates.tsx

# 5. Fix unused import in ElectionDetail
sed -i 's/import type { ElectionWithCandidates, Candidate }/import type { ElectionWithCandidates }/' src/pages/user/ElectionDetail.tsx

# 6. Fix unused variable in Results
sed -i 's/, index//' src/pages/admin/Results.tsx

# 7. Fix vote service function calls
sed -i 's/candidates ?? \[\]/\[\]/' src/services/vote.service.ts
sed -i 's/candidate\.id/candidate\.id || ""/' src/services/vote.service.ts
sed -i 's/candidate\.name/candidate\.name || candidate\.full_name || ""/' src/services/vote.service.ts
```

## Manual Fixes Needed

### 1. Fix useAdminData hooks
Edit `src/hooks/useAdminData.ts` and replace:
```typescript
user.role === 'voter'
```
with:
```typescript
user.role === 'student'
```

### 2. Add missing ElectionStatus type
Edit `src/types/index.ts` and add:
```typescript
export type ElectionStatus = 'active' | 'completed' | 'upcoming';
```

### 3. Fix StatusBadge import
Edit `src/components/shared/StatusBadge.tsx`:
```typescript
// Remove this line:
// import type { ElectionStatus } from '@/types';

// Replace with:
type ElectionStatus = 'active' | 'completed' | 'upcoming';
```

### 4. Fix CandidateCard schema issues
Edit `src/components/shared/CandidateCard.tsx` and add optional chaining:
```typescript
candidate.voteCount || 0
candidate.fullName || candidate.name || 'Unknown'
candidate.department || ''
candidate.bio || ''
```

## After Migration

Once you run the database migration (`supabase/migration_to_student_system.sql`), you can:

1. Regenerate the database types: `npx supabase gen types typescript --linked`
2. Update the imports and function calls to use the correct schema
3. Remove the temporary fixes and `as any` type assertions

## Build Command

After fixes:
```bash
npm run build
```

The project should now build successfully, allowing you to run the migration and complete the setup.