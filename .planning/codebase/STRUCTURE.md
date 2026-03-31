# Codebase Structure

**Analysis Date:** 2025-01-31

## Directory Layout

```
src/
├── assets/               # Static assets (images, fonts)
├── components/           # React components (30 files)
│   ├── experience/       # Animation/visual experience (2 files)
│   ├── layout/           # Layout wrappers & route guards (4 files)
│   ├── shared/           # Domain-specific reusable components (9 files)
│   ├── three/            # Three.js 3D visualizations (4 files)
│   └── ui/               # Base UI primitives (11 files)
├── constants/            # Application constants (2 files)
├── hooks/                # Custom React hooks (5 files)
├── lib/                  # Utility functions (5 files)
├── pages/                # Route-level page components (15 files)
│   ├── admin/            # Admin pages (8 files)
│   └── user/             # Student pages (4 files)
├── services/             # API/data layer (7 files)
├── store/                # Zustand state stores (1 file)
├── supabase/             # Supabase client & types (2 files)
├── types/                # TypeScript type definitions (1 file)
├── App.tsx               # Root component with routing
├── main.tsx              # Application entry point
└── index.css             # Global styles (Tailwind)
```

## Directory Purposes

**`src/components/ui/`**
- Purpose: Base UI primitives (buttons, inputs, cards)
- Contains: Avatar, Badge, BottomSheet, Button, Card, Input, Modal, ProgressBar, Select, Skeleton, Textarea
- Key files: `Button.tsx`, `Card.tsx`, `Input.tsx`, `Modal.tsx`
- Pattern: Simple presentational components with Tailwind styling

**`src/components/shared/`**
- Purpose: Domain-specific reusable components
- Contains: CandidateCard, ConfirmDialog, ElectionCard, EmptyState, LoadingPage, ProfilePictureModal, ResultBar, StatusBadge, VoteReceiptModal
- Key files: `ElectionCard.tsx`, `CandidateCard.tsx`, `LoadingPage.tsx`
- Pattern: Composed from UI primitives with domain logic

**`src/components/layout/`**
- Purpose: Page layouts and route protection
- Contains: AdminLayout, AdminRoute, UserLayout, UserRoute
- Key files: `AdminRoute.tsx`, `UserRoute.tsx` (guards), `AdminLayout.tsx`, `UserLayout.tsx` (shells)
- Pattern: Route guards check auth; Layouts provide navigation chrome

**`src/components/three/`**
- Purpose: Three.js 3D visualizations
- Contains: CardScene, FloatingCard, VotingAnimation, VotingScene
- Key files: `CardScene.tsx`, `VotingScene.tsx`
- Pattern: React Three Fiber components for visual flair

**`src/components/experience/`**
- Purpose: Interactive visual effects
- Contains: OrbField, TiltSurface
- Pattern: Decorative/interactive animations

**`src/pages/`**
- Purpose: Top-level route components
- Contains: Landing, AdminLogin, StudentRegistration
- Pattern: Directly rendered by router

**`src/pages/admin/`**
- Purpose: Admin portal pages
- Contains: Dashboard, Elections, CreateElection, Candidates, AddCandidate, Students, ManageAdmins, Results
- Key files: `Dashboard.tsx`, `Elections.tsx`, `Results.tsx`
- Pattern: Full-page components with data fetching

**`src/pages/user/`**
- Purpose: Student portal pages
- Contains: Home, ElectionDetail, VoteConfirm, MyVotes
- Key files: `Home.tsx`, `ElectionDetail.tsx`, `VoteConfirm.tsx`
- Pattern: Full-page components with election/vote logic

**`src/hooks/`**
- Purpose: Custom hooks for data fetching & state
- Contains: useAdminData, useAuth, useCandidates, useElections, useVotes
- Key files: `useElections.ts`, `useAuth.ts`
- Pattern: Return `{ data, loading, refresh }` tuples

**`src/services/`**
- Purpose: Supabase API abstraction
- Contains: auth.service, candidate.service, election.service, mappers, supabase.service, user.service, vote.service
- Key files: `auth.service.ts`, `election.service.ts`, `vote.service.ts`
- Pattern: Async functions wrapping Supabase queries

**`src/store/`**
- Purpose: Global state management
- Contains: authStore.ts
- Pattern: Zustand store with `user` and `loading` state

**`src/supabase/`**
- Purpose: Supabase client configuration
- Contains: client.ts, database.types.ts
- Pattern: Single exported `supabase` client instance

**`src/types/`**
- Purpose: TypeScript type definitions
- Contains: index.ts (all domain types)
- Pattern: Centralized type exports

**`src/lib/`**
- Purpose: Utility functions
- Contains: cn.ts, cropImage.ts, crypto.ts, dates.ts, errors.ts
- Key files: `cn.ts` (Tailwind class merging)
- Pattern: Pure utility functions

**`src/constants/`**
- Purpose: Application constants
- Contains: academic.ts, routes.ts
- Key files: `routes.ts` (ROUTES object), `academic.ts` (courses, years, sections)
- Pattern: Exported constants/enums

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React DOM render
- `src/App.tsx`: Router, auth listener, route definitions

**Configuration:**
- `src/supabase/client.ts`: Supabase client initialization
- `src/constants/routes.ts`: Route path constants
- `src/constants/academic.ts`: Academic domain constants

**Core Logic:**
- `src/services/auth.service.ts`: Authentication (register, login, logout)
- `src/services/election.service.ts`: Election CRUD operations
- `src/services/vote.service.ts`: Vote casting and retrieval
- `src/services/mappers.ts`: Database row → TypeScript type transforms

**State Management:**
- `src/store/authStore.ts`: Zustand auth store

**Types:**
- `src/types/index.ts`: All domain type definitions (AppUser, Election, Candidate, Vote, etc.)

**Testing:**
- No test files detected in `src/`

## Naming Conventions

**Files:**
- Components: PascalCase (`ElectionCard.tsx`, `UserLayout.tsx`)
- Hooks: camelCase with `use` prefix (`useElections.ts`, `useAuth.ts`)
- Services: kebab-case with `.service` suffix (`auth.service.ts`, `election.service.ts`)
- Types: `index.ts` barrel file
- Utilities: camelCase (`cn.ts`, `cropImage.ts`)

**Directories:**
- Lowercase, singular or plural based on content (`components`, `hooks`, `lib`, `types`)
- Nested by domain (`pages/admin/`, `pages/user/`)

**Exports:**
- Components: Default exports (`export default function ElectionCard()`)
- Services: Named exports (`export async function listElections()`)
- Hooks: Named exports (`export function useElections()`)
- Store: Named exports (`export const useAuthStore = create()`)

## Where to Add New Code

**New UI Component:**
- Primitive (button, input): `src/components/ui/NewComponent.tsx`
- Domain-specific: `src/components/shared/NewComponent.tsx`
- Layout/wrapper: `src/components/layout/NewComponent.tsx`

**New Page:**
- Admin page: `src/pages/admin/NewPage.tsx` + add route in `App.tsx`
- Student page: `src/pages/user/NewPage.tsx` + add route in `App.tsx`
- Public page: `src/pages/NewPage.tsx` + add route in `App.tsx`

**New Hook:**
- `src/hooks/useNewHook.ts`
- Pattern: `export function useNewHook() { return { data, loading, refresh }; }`

**New Service:**
- `src/services/newdomain.service.ts`
- Add mapper function in `src/services/mappers.ts`

**New Type:**
- Add interface/type to `src/types/index.ts`

**New Constant:**
- Domain constants: `src/constants/newdomain.ts`
- Routes: Add to `src/constants/routes.ts`

**New Utility:**
- `src/lib/newutil.ts`

## Path Aliases

**Configured in `tsconfig.json`:**
- `@/*` → `src/*`

**Usage:**
```typescript
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { listElections } from '@/services/election.service';
```

## Special Directories

**`src/supabase/`**
- Purpose: Supabase client and generated types
- Generated: `database.types.ts` (likely from Supabase CLI)
- Committed: Yes

**`dist/`**
- Purpose: Production build output
- Generated: Yes (`npm run build`)
- Committed: No (should be gitignored)

**`node_modules/`**
- Purpose: NPM dependencies
- Generated: Yes (`npm install`)
- Committed: No

## File Counts by Directory

| Directory | File Count |
|-----------|------------|
| `src/components/ui/` | 11 |
| `src/components/shared/` | 9 |
| `src/pages/admin/` | 8 |
| `src/services/` | 7 |
| `src/hooks/` | 5 |
| `src/lib/` | 5 |
| `src/pages/user/` | 4 |
| `src/components/layout/` | 4 |
| `src/components/three/` | 4 |
| `src/pages/` (root) | 3 |
| `src/components/experience/` | 2 |
| `src/constants/` | 2 |
| `src/supabase/` | 2 |
| `src/` (root) | 2 |
| `src/store/` | 1 |
| `src/types/` | 1 |

**Total TypeScript/TSX files:** ~70 files

---

*Structure analysis: 2025-01-31*
