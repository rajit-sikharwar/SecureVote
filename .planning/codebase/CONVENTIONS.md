# Coding Conventions

**Analysis Date:** 2025-01-23

## TypeScript Patterns

**Strict Mode:** Enabled
- `strict: true` in `tsconfig.app.json`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

**Type Definitions:**
- Centralized in `src/types/index.ts`
- Use `type` keyword for type aliases
- Use `interface` for object shapes with potential extension
- Union types for constrained values (e.g., `type Course = 'BCA' | 'BBA' | 'B.Tech' | ...`)

```typescript
// Union types for constrained values (src/types/index.ts)
export type Course = 'BCA' | 'BBA' | 'B.Tech' | 'MBA' | 'MCA' | 'BA' | 'B.Com' | 'M.Tech';
export type AcademicYear = 1 | 2 | 3 | 4;
export type UserRole = 'student' | 'admin';

// Interfaces for data structures
export interface AppUser {
  uid: string;
  email: string;
  fullName: string;
  // ...
}

// Extension pattern
export interface ElectionWithCandidates extends Election {
  candidates: Candidate[];
}
```

**Type Imports:**
- Use `import type { X }` for type-only imports
- Required by `verbatimModuleSyntax: true`

```typescript
// Correct pattern
import type { Election, Candidate } from '@/types';
import { someFunction } from '@/services/election.service';
```

**Generic Usage:**
- Minimal - primarily in Zustand store typing
- React component props use explicit interfaces

## Naming Patterns

**Files:**
- Components: `PascalCase.tsx` (e.g., `ElectionCard.tsx`, `Button.tsx`)
- Pages: `PascalCase.tsx` (e.g., `Dashboard.tsx`, `StudentRegistration.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useElections.ts`, `useAuth.ts`)
- Services: `kebab-case.service.ts` (e.g., `election.service.ts`, `auth.service.ts`)
- Utilities: `camelCase.ts` (e.g., `cn.ts`, `errors.ts`, `dates.ts`)
- Constants: `camelCase.ts` (e.g., `routes.ts`, `academic.ts`)
- Types: `index.ts` in `src/types/`

**Functions:**
- camelCase for all functions
- Async functions use descriptive verbs: `createElection`, `listUsers`, `castVote`
- Hooks start with `use`: `useAuth`, `useElections`, `useActiveElections`

**Variables:**
- camelCase for variables and parameters
- UPPER_SNAKE_CASE for constants objects: `ROUTES`, `COURSES`, `SECTIONS`

**Types/Interfaces:**
- PascalCase: `AppUser`, `Election`, `VoteDetails`
- Props interfaces: `ComponentNameProps` (e.g., `ButtonProps`, `CardProps`, `ElectionCardProps`)
- Info types for config objects: `CourseInfo`, `YearInfo`, `SectionInfo`

**React Components:**
- PascalCase function names
- Named exports preferred, default exports for pages

## React Patterns

**Component Structure:**
```typescript
// Standard component pattern (src/components/ui/Button.tsx)
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
    // Implementation
  }
);
Button.displayName = 'Button';
```

**Hooks Pattern:**
```typescript
// Custom hook pattern (src/hooks/useElections.ts)
export function useElections() {
  const { user } = useAuthStore();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    // async logic
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { elections, loading, refresh };
}
```

**Props Patterns:**
- Destructure props in function parameters
- Use spread for remaining HTML attributes: `{...props}`
- Default values in destructuring: `variant = 'primary'`

**State Management:**
- Zustand for global auth state (`src/store/authStore.ts`)
- Local `useState` for component state
- No prop drilling - use hooks to access store

```typescript
// Zustand store pattern (src/store/authStore.ts)
interface AuthState {
  user: AppUser | null;
  loading: boolean;
  setUser: (user: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  clearUser: () => set({ user: null }),
}));
```

**Form Handling:**
- react-hook-form with Zod validation
- `zodResolver` for schema integration

```typescript
// Form pattern (src/pages/StudentRegistration.tsx)
const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  // ...
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Form = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
  resolver: zodResolver(schema),
  defaultValues: { year: 1 },
});
```

## Styling Approach

**Primary:** Tailwind CSS
- Utility-first approach
- Custom brand colors defined in `tailwind.config.ts`
- Mobile-first responsive design

**Tailwind Configuration:**
```typescript
// tailwind.config.ts
colors: {
  brand: {
    50: '#ecfeff',
    100: '#cffafe',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    900: '#164e63',
  },
}
```

**Class Merging:**
- Use `cn()` utility from `src/lib/cn.ts` for conditional classes
- Combines `clsx` and `tailwind-merge`

```typescript
// cn utility usage
import { cn } from '@/lib/cn';

<button className={cn(
  "base-styles",
  variant === 'primary' && "primary-styles",
  className
)}>
```

**Component Variants:**
- Define variant objects within components
- Use object lookup for variant classes

```typescript
// Variant pattern (src/components/ui/Button.tsx)
const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  outline: 'border border-gray-300 bg-transparent hover:bg-gray-50',
  ghost: 'bg-transparent hover:bg-brand-50 text-brand-600',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};
```

**Animation:**
- Framer Motion for complex animations (`framer-motion`)
- Tailwind transitions for simple hover/focus states
- Three.js/React Three Fiber for 3D elements

**MUI Usage:**
- Minimal - primarily icons from `@mui/icons-material`
- Not used for UI components (custom Tailwind components instead)

## Import Organization

**Order:**
1. React and core libraries (`react`, `react-dom`, `react-router-dom`)
2. Third-party libraries (UI, utilities)
3. Internal aliases (`@/` path)
4. Relative imports
5. Type imports (with `type` keyword)

```typescript
// Example import order (src/pages/user/VoteConfirm.tsx)
import { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { getElectionWithCandidates } from '@/services/election.service';
import { Button } from '@/components/ui/Button';
import type { ElectionWithCandidates, Candidate } from '@/types';
```

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.app.json`)
- Always use `@/` for internal imports

## Error Handling

**Service Layer:**
- Use `assertNoError()` utility for Supabase errors
- Throw descriptive `Error` objects

```typescript
// Error assertion pattern (src/services/supabase.service.ts)
export function assertNoError(error: PostgrestError | null, fallback: string): void {
  if (error) {
    throw new Error(error.message || fallback);
  }
}

// Usage in services
const { data, error } = await supabase.from('elections').select('*');
assertNoError(error, 'Failed to load elections.');
```

**User-Facing Errors:**
- Map error codes to friendly messages in `src/lib/errors.ts`
- Use `toast.error()` for user notifications

```typescript
// Error mapping (src/lib/errors.ts)
export function getAppError(code: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password.',
    'already-exists': 'You have already voted in this election.',
    // ...
  };
  return map[code] ?? `Something went wrong (${code}). Please try again.`;
}
```

**Component Error Handling:**
```typescript
// Try-catch with toast pattern
try {
  await someAsyncOperation();
  toast.success('Operation successful!');
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : 'Operation failed';
  toast.error(message);
}
```

## Logging

**Framework:** `console` (native)

**Patterns:**
- `console.error()` for caught exceptions
- `console.warn()` for non-critical issues
- No production logging framework

```typescript
} catch (error) {
  console.error('Failed to load stats:', error);
}
```

## Comments

**JSDoc:** Not consistently used

**When to Comment:**
- Function purpose documentation (sparse)
- Complex logic explanation (minimal)

```typescript
/**
 * Get active elections for a student (based on current time and eligibility)
 */
export async function getActiveElectionsForStudent(...) { }
```

## Function Design

**Size:** Generally compact, single-purpose functions

**Parameters:**
- Use object parameters for functions with many arguments
- Destructure in service functions

```typescript
// Object parameter pattern
export async function listElections(filters?: {
  course?: Course;
  year?: AcademicYear;
  section?: Section;
}): Promise<Election[]> { }
```

**Return Values:**
- Always typed explicitly
- Use `Promise<T>` for async functions
- Return `null` for "not found" cases

## Module Design

**Exports:**
- Named exports for utilities and components
- Default exports for page components
- Barrel exports in `src/types/index.ts`

```typescript
// Named exports (src/services/election.service.ts)
export async function listElections(...) { }
export async function getElectionById(...) { }
export async function createElection(...) { }

// Default export for pages
export default function AdminDashboard() { }
```

**Data Mappers:**
- Centralized in `src/services/mappers.ts`
- Convert database rows to application types

```typescript
// Mapper pattern (src/services/mappers.ts)
export function mapUser(row: UserRow): AppUser {
  return {
    uid: row.id,
    email: row.email,
    fullName: row.full_name,
    // camelCase conversion
  };
}
```

## Constants

**Location:** `src/constants/`

**Pattern:**
- Export typed arrays with metadata objects
- Export helper functions alongside constants

```typescript
// Constants pattern (src/constants/academic.ts)
export const COURSES: CourseInfo[] = [
  { id: 'BCA', label: 'BCA', duration: 3, fullName: 'Bachelor of Computer Applications' },
  // ...
];

export function getCourseInfo(courseId: Course): CourseInfo | undefined {
  return COURSES.find(c => c.id === courseId);
}
```

## Route Guards

**Pattern:** Layout components that check auth state

```typescript
// Route guard pattern (src/components/layout/AdminRoute.tsx)
export default function AdminRoute() {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to={ROUTES.STUDENT_HOME} replace />;
  }

  return <AdminLayout />;
}
```

## forwardRef Pattern

**Usage:** All form input components use `forwardRef` for react-hook-form compatibility

```typescript
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <input ref={ref} {...props} />
    );
  }
);
Input.displayName = 'Input';
```

---

*Convention analysis: 2025-01-23*
