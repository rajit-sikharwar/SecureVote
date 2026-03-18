# SecureVote

SecureVote is a React + Vite voting platform now migrated from Firebase to Supabase. It includes:

- Supabase authentication for Google OAuth and admin email/password login
- Supabase Postgres storage for voters, elections, candidates, votes, and audit logs
- Tailwind CSS for a clean, scalable UI system
- Framer Motion for a medium-complexity 3D-style experience with tilt, glow, and layered panels

## Project Structure

```text
src
  assets        Static images and bundled assets
  components    Reusable UI, shared widgets, layouts, and motion experience pieces
  constants     Route and category constants
  hooks         Data-fetching and stateful React hooks
  lib           Small utilities such as date parsing, crypto helpers, and error mapping
  pages         Route-level screens for public, voter, and admin flows
  services      Supabase-backed business logic for auth, elections, candidates, votes, and users
  store         Global Zustand state such as authenticated user session data
  supabase      Supabase client setup and database typings
  types         Frontend-friendly app models
```

Folder purpose summary:

- `components`: keeps UI primitives and layout shells reusable and beginner-friendly.
- `pages`: holds route screens so flows stay easy to trace.
- `hooks`: centralizes fetch logic and refresh behavior away from JSX.
- `services`: contains all Supabase access, so pages do not talk directly to the database.
- `supabase`: stores the client instance and typed database contract.
- `assets`: image and branding files.

## Supabase Setup

1. Create a Supabase project.
2. In the Supabase SQL editor, run [`supabase/schema.sql`](/c:/Users/sikha/Documents/SecureVote/supabase/schema.sql).
3. In Authentication, enable:
   - Google provider for voter sign-in
   - Email/password for admin sign-in
4. Add your local URL such as `http://localhost:5173` to the Supabase redirect URLs.
5. Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

6. Seed one admin user:
   - Create the admin in Supabase Authentication.
   - Insert a matching row in `public.users` with `role = 'admin'`.

## Install And Run

```bash
npm install
npm run dev
```

The Vite dev server will usually start at `http://localhost:5173`.

## Production Build

```bash
npm run build
npm run preview
```

## Example Flows

### Authentication flow

- Voter fills the registration form.
- Registration is stored in `public.registrations`.
- Voter signs in with Google.
- On session restore, the app checks for an existing `public.users` profile.
- If no profile exists, it converts the pending registration into a real voter profile.
- Admin signs in with email/password and must already exist in `public.users` with role `admin`.

### Database interaction examples

- Create election: [`src/services/election.service.ts`](/c:/Users/sikha/Documents/SecureVote/src/services/election.service.ts)
- Add candidate: [`src/services/candidate.service.ts`](/c:/Users/sikha/Documents/SecureVote/src/services/candidate.service.ts)
- Cast vote via RPC: [`src/services/vote.service.ts`](/c:/Users/sikha/Documents/SecureVote/src/services/vote.service.ts)
- Supabase client config: [`src/supabase/client.ts`](/c:/Users/sikha/Documents/SecureVote/src/supabase/client.ts)

## Notes

- Firebase was fully removed from dependencies and source files.
- Sensitive credentials are read from Vite environment variables instead of hardcoding them.
- The vote casting path now uses a Supabase SQL function to keep the vote, counters, and audit log update atomic.
