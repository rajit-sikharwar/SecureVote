# Architecture

**Analysis Date:** 2025-01-31

## Pattern Overview

**Overall:** Feature-Based Layered Architecture with Role-Based Routing

**Key Characteristics:**
- React SPA with Vite as build tool
- Zustand for global state management (auth state)
- Service layer for Supabase API abstraction
- Role-based routing with protected route guards (Admin/User)
- Lazy-loaded page components for code splitting
- Custom hooks for data fetching patterns

## Layers

**UI Layer:**
- Purpose: Render user interface components
- Location: `src/components/`
- Contains: Reusable UI primitives (`ui/`), shared domain components (`shared/`), layout wrappers (`layout/`), 3D visualizations (`three/`, `experience/`)
- Depends on: Types, lib utilities
- Used by: Pages

**Page Layer:**
- Purpose: Route-level components that compose UI and handle page-specific logic
- Location: `src/pages/`
- Contains: Landing, auth pages, admin pages (`admin/`), student pages (`user/`)
- Depends on: Components, hooks, services, store
- Used by: App.tsx router

**Hooks Layer:**
- Purpose: Encapsulate data fetching and state logic
- Location: `src/hooks/`
- Contains: `useAuth`, `useElections`, `useVotes`, `useCandidates`, `useAdminData`
- Depends on: Services, store
- Used by: Pages, components

**Service Layer:**
- Purpose: Abstract Supabase API interactions
- Location: `src/services/`
- Contains: `auth.service.ts`, `election.service.ts`, `vote.service.ts`, `candidate.service.ts`, `user.service.ts`
- Depends on: Supabase client, mappers, types
- Used by: Hooks, pages (directly in some cases)

**Store Layer:**
- Purpose: Global state management
- Location: `src/store/`
- Contains: `authStore.ts` (Zustand store for user/loading state)
- Depends on: Types
- Used by: Entire application

**Database Layer:**
- Purpose: Supabase client configuration and type definitions
- Location: `src/supabase/`
- Contains: `client.ts`, `database.types.ts`
- Depends on: Environment variables
- Used by: Services

## Data Flow

**Authentication Flow:**

1. User submits login form in `StudentRegistration.tsx` or `AdminLogin.tsx`
2. Service (`auth.service.ts`) calls Supabase auth API
3. `onAuthChange` callback in `App.tsx` fires
4. `resolveAuthenticatedUser` fetches user profile from `users` table
5. `useAuthStore.setUser()` updates global state
6. Route guards (`UserRoute`/`AdminRoute`) redirect based on role

**Voting Flow:**

1. Student navigates to `ElectionDetail.tsx`
2. Hook/page fetches election with candidates via `getElectionWithCandidates()`
3. Student clicks candidate → navigates to `VoteConfirm.tsx`
4. Confirmation calls `castVote()` in `vote.service.ts`
5. Server-side `cast_vote` RPC validates eligibility and records vote
6. Audit log entry created automatically

**State Management:**
- **Auth State:** Zustand store (`useAuthStore`) holds `user`, `loading`
- **Local State:** React `useState` for component-specific data
- **Server State:** Fetched via hooks with `useEffect` + async functions

## Key Abstractions

**AppUser:**
- Purpose: Unified user model for students and admins
- Examples: `src/types/index.ts`
- Pattern: TypeScript interface with role discrimination

**Election/Candidate Relationship:**
- Purpose: Many-to-many via `election_candidates` junction table
- Examples: `src/services/election.service.ts`, `src/services/candidate.service.ts`
- Pattern: Junction table queries with separate candidate lookups

**Mappers:**
- Purpose: Transform Supabase row types to application types
- Examples: `src/services/mappers.ts`
- Pattern: Explicit camelCase transformation with defaults

## Entry Points

**Application Entry:**
- Location: `src/main.tsx`
- Triggers: Browser loads `index.html`
- Responsibilities: Mount React root, import global CSS

**Router Entry:**
- Location: `src/App.tsx`
- Triggers: Application mounts
- Responsibilities: Set up BrowserRouter, auth listener, route definitions

**Auth Listener:**
- Location: `src/App.tsx` (useEffect)
- Triggers: Supabase auth state change
- Responsibilities: Sync auth state to Zustand store

## Routing Structure

**Public Routes:**
- `/` → Landing page
- `/register` → Student registration
- `/admin/login` → Admin login

**Protected Student Routes (UserRoute guard):**
- `/home` → Student dashboard
- `/election/:id` → Election detail
- `/vote/:electionId/:candidateId` → Vote confirmation
- `/my-votes` → Voting history

**Protected Admin Routes (AdminRoute guard):**
- `/admin` → Admin dashboard
- `/admin/elections` → Elections management
- `/admin/elections/create` → Create election
- `/admin/candidates` → Candidates management
- `/admin/candidates/add` → Add candidate
- `/admin/students` → Students management
- `/admin/manage-admins` → Admin management
- `/admin/results` → Results viewing

## Error Handling

**Strategy:** Service-level try/catch with user-friendly error messages

**Patterns:**
- `assertNoError()` helper throws on Supabase errors: `src/services/supabase.service.ts`
- Services throw `Error` with descriptive messages
- Pages/hooks catch and log errors, show toast notifications
- Specific error handling in `castVote()` for domain-specific errors (eligibility, already voted, etc.)

## Cross-Cutting Concerns

**Logging:** Console logging for errors; audit_logs table for security events

**Validation:** 
- Client-side: Zod schemas with react-hook-form (form validation)
- Server-side: Supabase RPC functions validate vote eligibility

**Authentication:** 
- Supabase Auth handles session management
- Route guards check `user.role` from Zustand store
- Academic eligibility (course/year/section) checked at component level

**Toast Notifications:** 
- `react-hot-toast` configured in `App.tsx`
- Services/pages trigger `toast.success()` / `toast.error()`

## Architectural Decisions

**Lazy Loading:** All page components use `React.lazy()` for code splitting

**No Server State Cache:** Data re-fetched on mount; no React Query/SWR (simple refresh pattern)

**Session Non-Persistence:** Auth session cleared on app load for security (`App.tsx` clears storage)

**Supabase RPC for Voting:** `cast_vote` stored procedure ensures atomic, validated vote recording

---

*Architecture analysis: 2025-01-31*
