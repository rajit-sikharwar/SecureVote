# Roadmap: SecureVote

## Overview

SecureVote v1.0 Stabilization focuses on fixing critical bugs, hardening security, adding baseline test coverage, and synchronizing database types. This milestone prepares the application for reliable production use before adding new features.

## Milestones

- 🚧 **v1.0 Stabilization** - Phases 1-4 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Results Bug Fix** - Fix election results showing 0 votes
- [ ] **Phase 2: Security Hardening** - Credential validation and password policy
- [ ] **Phase 3: Testing Foundation** - Add Vitest and core service tests
- [ ] **Phase 4: Type Synchronization** - Regenerate and fix database types

## Phase Details

### Phase 1: Results Bug Fix
**Goal**: Admin dashboard displays correct election results with accurate vote counts
**Depends on**: Nothing (first phase)
**Requirements**: BUG-01, BUG-02
**Success Criteria** (what must be TRUE):
  1. Admin can select an election and see total votes cast
  2. Candidate ranking shows correct vote counts
  3. Bar chart displays vote distribution accurately
  4. Pie chart renders vote share percentages
  5. Admin dashboard overview shows correct totalVotesCast
**Plans**: TBD

Plans:
- [x] 01-01: Create SECURITY DEFINER functions to bypass RLS
- [x] 01-02: Fix admin dashboard totalVotesCast calculation

### Phase 2: Security Hardening
**Goal**: Application fails safely with missing config and enforces strong passwords
**Depends on**: Phase 1
**Requirements**: SEC-01, SEC-02
**Success Criteria** (what must be TRUE):
  1. App throws error on startup if VITE_SUPABASE_URL is missing
  2. App throws error on startup if VITE_SUPABASE_ANON_KEY is missing
  3. Registration form requires 8+ character password
  4. Password requires at least one uppercase letter
  5. Password requires at least one number
**Plans**: TBD

Plans:
- [ ] 02-01: Credential validation and password policy

### Phase 3: Testing Foundation
**Goal**: Core voting and auth services have unit test coverage
**Depends on**: Phase 1 (needs stable services to test)
**Requirements**: TEST-01, TEST-02, TEST-03
**Success Criteria** (what must be TRUE):
  1. `npm test` runs Vitest successfully
  2. vote.service.ts has tests for castVote flow
  3. vote.service.ts has tests for eligibility checks
  4. auth.service.ts has tests for signIn functions
  5. auth.service.ts has tests for registration
**Plans**: TBD

Plans:
- [ ] 03-01: Configure Vitest
- [ ] 03-02: Vote service tests
- [ ] 03-03: Auth service tests

### Phase 4: Type Synchronization
**Goal**: Database types match schema and reduce `any` assertions
**Depends on**: Phase 3 (tests will catch type-related regressions)
**Requirements**: TYPE-01, TYPE-02
**Success Criteria** (what must be TRUE):
  1. database.types.ts regenerated from Supabase schema
  2. Mapper files have fewer `as any` assertions
  3. Build passes with no new type errors
**Plans**: TBD

Plans:
- [ ] 04-01: Regenerate types and fix mappers

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Results Bug Fix | 2/2 | Complete | 2026-03-31 |
| 2. Security Hardening | 0/1 | Not started | - |
| 3. Testing Foundation | 0/3 | Not started | - |
| 4. Type Synchronization | 0/1 | Not started | - |

---
*Roadmap created: 2026-03-31*
*Last updated: 2026-03-31*
