# Testing Patterns

**Analysis Date:** 2025-01-23

## Test Framework

**Status:** No testing infrastructure configured

**Runner:** Not configured
- No `jest.config.*` or `vitest.config.*` files present
- No test runner in `package.json` dependencies
- No test script in `package.json`

**Current Scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

## Test File Organization

**Status:** No test files exist

**Search Results:**
- No `*.test.*` files in `src/`
- No `*.spec.*` files in `src/`
- No `__tests__/` directories in `src/`

## Test Coverage

**Coverage:** 0%

**Untested Areas (All Code):**

| Area | Location | Risk Level |
|------|----------|------------|
| Authentication flows | `src/services/auth.service.ts` | **Critical** |
| Vote casting logic | `src/services/vote.service.ts` | **Critical** |
| Election management | `src/services/election.service.ts` | **High** |
| Data mappers | `src/services/mappers.ts` | **High** |
| Form validation schemas | `src/pages/StudentRegistration.tsx` | **Medium** |
| Custom hooks | `src/hooks/*.ts` | **Medium** |
| UI components | `src/components/ui/*.tsx` | **Low** |
| Route guards | `src/components/layout/*Route.tsx` | **Medium** |
| Utility functions | `src/lib/*.ts` | **Medium** |
| Constants/helpers | `src/constants/*.ts` | **Low** |

## Recommended Test Setup

### Install Dependencies

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event
```

### Vitest Configuration

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup File

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase client
vi.mock('@/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    rpc: vi.fn(),
  },
}));
```

### Package.json Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Priority Test Cases

### Critical: Authentication (`src/services/auth.service.ts`)

```typescript
// src/services/__tests__/auth.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signInStudent, signInAdmin, registerStudent, signOut } from '../auth.service';
import { supabase } from '@/supabase/client';

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signInStudent', () => {
    it('should return user when credentials are valid', async () => {
      // Mock Supabase response
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: { id: 'user-123' }, session: {} },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: 'user-123', role: 'student', full_name: 'Test User' },
          error: null,
        }),
      });

      const result = await signInStudent('test@example.com', 'password');
      expect(result.role).toBe('student');
    });

    it('should throw error for invalid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(signInStudent('bad@email.com', 'wrong'))
        .rejects.toThrow('Invalid login credentials');
    });

    it('should reject non-student users', async () => {
      // Setup admin user trying student login
      // Should throw 'Invalid student account.'
    });
  });

  describe('signInAdmin', () => {
    it('should reject non-admin users', async () => {
      // Test admin route protection
    });
  });
});
```

### Critical: Voting (`src/services/vote.service.ts`)

```typescript
// src/services/__tests__/vote.service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { castVote, hasVoted, getUserVotes } from '../vote.service';

describe('vote.service', () => {
  describe('castVote', () => {
    it('should call RPC with correct parameters', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ error: null });

      await castVote('user-1', 'election-1', 'candidate-1');

      expect(supabase.rpc).toHaveBeenCalledWith('cast_vote', {
        p_user_id: 'user-1',
        p_election_id: 'election-1',
        p_candidate_id: 'candidate-1',
      });
    });

    it('should throw when user not eligible', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        error: { message: 'User is not eligible' },
      });

      await expect(castVote('user-1', 'election-1', 'candidate-1'))
        .rejects.toThrow('You are not eligible to vote in this election.');
    });

    it('should throw when already voted', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        error: { message: 'User has already voted' },
      });

      await expect(castVote('user-1', 'election-1', 'candidate-1'))
        .rejects.toThrow('You have already voted in this election.');
    });
  });

  describe('hasVoted', () => {
    it('should return true when vote exists', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        mockResolvedValue: { count: 1, error: null },
      });

      const result = await hasVoted('user-1', 'election-1');
      expect(result).toBe(true);
    });
  });
});
```

### High: Data Mappers (`src/services/mappers.ts`)

```typescript
// src/services/__tests__/mappers.test.ts
import { describe, it, expect } from 'vitest';
import { mapUser, mapElection, mapCandidate, mapVote } from '../mappers';

describe('mappers', () => {
  describe('mapUser', () => {
    it('should convert snake_case DB row to camelCase AppUser', () => {
      const dbRow = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        phone: '1234567890',
        role: 'student',
        is_active: true,
        course: 'BCA',
        year: 2,
        section: 'A',
      };

      const result = mapUser(dbRow);

      expect(result.uid).toBe('user-123');
      expect(result.fullName).toBe('Test User');
      expect(result.isActive).toBe(true);
    });

    it('should provide defaults for missing fields', () => {
      const minimalRow = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test',
        role: 'student',
      };

      const result = mapUser(minimalRow);

      expect(result.course).toBe('BCA'); // default
      expect(result.year).toBe(1); // default
      expect(result.section).toBe('A'); // default
    });
  });

  describe('mapElection', () => {
    it('should convert election row correctly', () => {
      const dbRow = {
        id: 'elec-1',
        title: 'Class Rep Election',
        description: 'Vote for CR',
        start_time: '2024-01-01T00:00:00Z',
        end_time: '2024-01-02T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        created_by: 'admin-1',
      };

      const result = mapElection(dbRow);

      expect(result.startTime).toBe('2024-01-01T00:00:00Z');
      expect(result.endTime).toBe('2024-01-02T00:00:00Z');
    });
  });
});
```

### Medium: Utility Functions (`src/lib/`)

```typescript
// src/lib/__tests__/errors.test.ts
import { describe, it, expect } from 'vitest';
import { getAppError } from '../errors';

describe('getAppError', () => {
  it('should return mapped message for known codes', () => {
    expect(getAppError('Invalid login credentials'))
      .toBe('Invalid email or password.');

    expect(getAppError('already-exists'))
      .toBe('You have already voted in this election.');
  });

  it('should return fallback message for unknown codes', () => {
    const result = getAppError('UNKNOWN_CODE');
    expect(result).toContain('UNKNOWN_CODE');
    expect(result).toContain('Something went wrong');
  });
});
```

```typescript
// src/lib/__tests__/dates.test.ts
import { describe, it, expect } from 'vitest';
import { toDate } from '../dates';

describe('toDate', () => {
  it('should parse valid ISO string', () => {
    const result = toDate('2024-01-15T10:30:00Z');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2024);
  });

  it('should return null for null/undefined input', () => {
    expect(toDate(null)).toBeNull();
    expect(toDate(undefined)).toBeNull();
  });

  it('should return null for invalid date string', () => {
    expect(toDate('not-a-date')).toBeNull();
  });
});
```

### Medium: Custom Hooks

```typescript
// src/hooks/__tests__/useElections.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useElections } from '../useElections';
import * as electionService from '@/services/election.service';

vi.mock('@/services/election.service');
vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: { uid: 'user-1', role: 'student', course: 'BCA', year: 1, section: 'A' },
  }),
}));

describe('useElections', () => {
  it('should load elections for student user', async () => {
    vi.mocked(electionService.listElections).mockResolvedValue([
      { id: '1', title: 'Election 1', course: 'BCA', year: 1, section: 'A' },
    ]);

    const { result } = renderHook(() => useElections());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.elections).toHaveLength(1);
  });
});
```

### Low: UI Components

```typescript
// src/components/ui/__tests__/Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('shows loading spinner when loading', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-brand-600');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Test File Naming Convention

When implementing tests, follow this pattern:

```
src/
├── services/
│   ├── auth.service.ts
│   └── __tests__/
│       └── auth.service.test.ts
├── hooks/
│   ├── useElections.ts
│   └── __tests__/
│       └── useElections.test.tsx
├── components/
│   └── ui/
│       ├── Button.tsx
│       └── __tests__/
│           └── Button.test.tsx
└── lib/
    ├── errors.ts
    └── __tests__/
        └── errors.test.ts
```

## Mocking Strategies

### Supabase Client Mock

```typescript
// src/test/mocks/supabase.ts
export const createSupabaseMock = () => ({
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  })),
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  rpc: vi.fn(),
});
```

### Router Mock

```typescript
// For components using react-router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: 'test-id' }),
  };
});
```

### Toast Mock

```typescript
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));
```

## E2E Testing

**Status:** Not implemented

**Recommendation:** Consider Playwright for critical user flows:
- Student registration flow
- Login/logout flow
- Vote casting flow
- Admin election creation

## Summary

| Metric | Status |
|--------|--------|
| Test Framework | ❌ Not configured |
| Unit Tests | ❌ None |
| Integration Tests | ❌ None |
| E2E Tests | ❌ None |
| Coverage | 0% |

**Priority Implementation Order:**
1. Set up Vitest with React Testing Library
2. Test critical services (`auth.service.ts`, `vote.service.ts`)
3. Test data mappers (`mappers.ts`)
4. Test utility functions (`lib/*.ts`)
5. Test custom hooks
6. Test UI components
7. Add E2E tests for critical flows

---

*Testing analysis: 2025-01-23*
