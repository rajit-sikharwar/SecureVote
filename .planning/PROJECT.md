# SecureVote

## What This Is

A college election voting application that enables students to vote in elections and administrators to manage elections, candidates, and results. Built with React/TypeScript frontend and Supabase backend, deployed to Vercel.

## Core Value

**Secure and accurate vote counting** — Students must be able to cast exactly one vote per election, and administrators must see accurate results. If this fails, the entire system loses trust.

## Current Milestone: v1.0 Stabilization

**Goal:** Fix critical issues preventing reliable operation and establish foundation for future development.

**Target features:**
- Fix election results display bug (RLS bypass functions)
- Resolve critical security issues (credential validation, password policy)
- Add baseline testing infrastructure
- Fix admin dashboard vote count display

## Requirements

### Validated

<!-- Shipped and confirmed valuable. From existing codebase. -->

- ✓ **AUTH-01**: Students can register with college email — existing
- ✓ **AUTH-02**: Students can sign in with Google OAuth — existing
- ✓ **AUTH-03**: Admins can sign in with email/password — existing
- ✓ **ELECTION-01**: Admins can create elections with date range — existing
- ✓ **ELECTION-02**: Admins can add candidates to elections — existing
- ✓ **VOTE-01**: Students can view active elections — existing
- ✓ **VOTE-02**: Students can cast one vote per election — existing
- ✓ **VOTE-03**: Students receive vote confirmation receipt — existing
- ✓ **RESULTS-01**: Admins can view election results — existing (fixed in this session)
- ✓ **RESULTS-02**: Results show candidate ranking with votes — existing
- ✓ **RESULTS-03**: Results include bar chart visualization — existing
- ✓ **RESULTS-04**: Results include pie chart visualization — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] **RESULTS-05**: Admin dashboard shows correct total votes cast
- [ ] **SECURITY-01**: Application fails fast when Supabase credentials missing
- [ ] **SECURITY-02**: Password policy enforces minimum 8 chars with complexity
- [ ] **TESTING-01**: Voting service has unit test coverage
- [ ] **TESTING-02**: Auth service has unit test coverage
- [ ] **TYPES-01**: Database types regenerated and synchronized

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- New election types (ranked choice, approval) — focus on stabilization first
- Mobile app — web-first, assess after v1.0
- Voter anonymity audit log — requires significant architecture changes
- Real-time results streaming — not needed for typical college elections

## Context

**Technical state:**
- React 19 + TypeScript 5.9 + Vite 8
- Supabase backend with RLS policies
- No test coverage exists
- Database types out of sync (30+ `any` assertions)
- Recent bug fix: Election results now use SECURITY DEFINER functions to bypass RLS

**Known issues:**
- Fallback Supabase credentials mask configuration errors
- Admin dashboard totalVotesCast hardcoded to 0
- Password minimum only 6 characters
- Multiple RLS policy migrations with overlap

**User context:**
- Deployed to Vercel
- Active development
- User requested no commits — reviewing code manually

## Constraints

- **Stack**: React/TypeScript/Supabase — established, no framework changes
- **Deployment**: Vercel — existing setup, SPA routing configured
- **Testing**: Must add Vitest — compatible with Vite ecosystem
- **Security**: Must not weaken existing RLS policies

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use SECURITY DEFINER for results | RLS blocks admin queries for vote data | ✓ Good — results now display correctly |
| Keep RPC fallback in vote.service | Backward compatibility if functions don't exist | — Pending |
| Use Vitest for testing | Native Vite integration, similar API to Jest | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-31 after milestone initialization*
