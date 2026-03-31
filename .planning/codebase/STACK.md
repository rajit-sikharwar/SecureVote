# Technology Stack

**Analysis Date:** 2025-01-24

## Languages

**Primary:**
- TypeScript ~5.9.3 - All application code (`.ts`, `.tsx`)

**Secondary:**
- SQL (PostgreSQL) - Database schema, RLS policies, stored functions (`supabase/schema.sql`)

## Runtime

**Environment:**
- Node.js (browser runtime via Vite)
- Target: ES2023 (see `tsconfig.app.json`)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React ^19.2.4 - UI framework (latest React 19)
- React Router DOM ^6.30.3 - Client-side routing
- Vite ^8.0.0 - Build tool and dev server

**UI/Styling:**
- Tailwind CSS ^3.4.19 - Utility-first CSS
- MUI (Material-UI) ^7.3.9 - Component library (`@mui/material`, `@mui/icons-material`)
- Emotion ^11.14.0 - CSS-in-JS for MUI (`@emotion/react`, `@emotion/styled`)
- Framer Motion ^12.38.0 - Animation library

**3D Graphics:**
- Three.js ^0.183.2 - 3D rendering
- React Three Fiber ^9.5.0 - React renderer for Three.js
- React Three Drei ^10.7.7 - Helper components for R3F

**Testing:**
- Not configured (no test framework detected in `package.json`)

**Build/Dev:**
- Vite ^8.0.0 - Dev server and bundler
- TypeScript ~5.9.3 - Type checking
- ESLint ^9.39.4 - Linting
- PostCSS ^8.5.8 - CSS processing
- Autoprefixer ^10.4.27 - CSS vendor prefixes

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` ^2.99.2 - Backend-as-a-Service (auth, database, realtime)
- `zustand` ^5.0.12 - State management
- `react-hook-form` ^7.71.2 - Form handling
- `zod` ^4.3.6 - Schema validation
- `@hookform/resolvers` ^5.2.2 - Zod integration with react-hook-form

**Data/Charts:**
- `recharts` ^3.8.0 - Data visualization (bar charts, pie charts)
- `date-fns` ^4.1.0 - Date manipulation

**PDF Generation:**
- `jspdf` ^4.2.1 - PDF document generation
- `jspdf-autotable` ^5.0.7 - Table generation for jsPDF

**UI Utilities:**
- `lucide-react` ^0.577.0 - Icon library
- `clsx` ^2.1.1 - Conditional class names
- `tailwind-merge` ^3.5.0 - Merge Tailwind classes safely
- `react-hot-toast` ^2.6.0 - Toast notifications
- `react-easy-crop` ^5.5.6 - Image cropping

## Configuration

**TypeScript (`tsconfig.app.json`):**
- Target: ES2023
- Module: ESNext with bundler resolution
- Strict mode enabled
- Path alias: `@/*` → `./src/*`
- JSX: react-jsx

**Vite (`vite.config.ts`):**
```typescript
// Path alias configured
resolve: {
  alias: { '@': path.resolve(__dirname, './src') }
}

// CORS headers for OAuth popups
server: {
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
  }
}
```

**Tailwind (`tailwind.config.ts`):**
- Content paths: `./index.html`, `./src/**/*.{ts,tsx}`
- Custom brand colors (cyan-based: `brand-50` through `brand-900`)
- Custom font: Space Grotesk
- Custom breakpoint: `xs: 390px`
- Custom max-width: `mobile: 430px`

**ESLint (`eslint.config.js`):**
- TypeScript-ESLint recommended
- React Hooks plugin
- React Refresh plugin (for HMR)
- Flat config format (ESLint 9.x)

**Environment Variables:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Build Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript check + Vite build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

**Build Output:**
- Directory: `dist/`
- Sourcemaps: disabled in production

## Platform Requirements

**Development:**
- Node.js (version not specified, modern LTS recommended)
- npm for package management

**Production:**
- Static hosting (Vercel configured via `vercel.json`)
- SPA routing support required

## Key Patterns

**Path Aliasing:**
All imports use `@/` prefix for `src/` directory:
```typescript
import { supabase } from '@/supabase/client';
import { Button } from '@/components/ui/Button';
```

**Class Name Utility (`src/lib/cn.ts`):**
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Lazy Loading:**
Routes use React lazy loading with Suspense:
```typescript
const Landing = lazy(() => import('@/pages/Landing'));
```

---

*Stack analysis: 2025-01-24*
