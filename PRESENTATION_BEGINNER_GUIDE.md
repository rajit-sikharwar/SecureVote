# SecureVote Project Explanation (Beginner Friendly)

## 1) Absolute Basics: What is this project?

### What this project is
SecureVote is a web application for college elections.
It helps students vote digitally instead of paper voting.
It also gives admins a dashboard to create elections, manage candidates, and view results.

### What problem it solves
- Manual voting is slow and hard to manage.
- Paper voting can have counting mistakes.
- It is difficult to restrict who can vote in which election.
- It is hard to show live results safely.

SecureVote solves this by:
- letting only eligible students vote,
- allowing only one vote per student per election,
- storing all votes safely in a database,
- showing real-time analytics to admins.

### Real-world use
This type of system is used in:
- college class representative elections,
- department-level voting,
- student council elections,
- any organization where secure digital voting is needed.

Simple analogy:
Think of SecureVote as an online exam portal, but for voting.
Only eligible students can enter, submit once, and results are counted automatically.

---

## 2) Project Overview (Step-by-step flow)

## Full working flow
1. Student opens the website.
2. Student registers with personal + academic details.
3. Student logs in.
4. System checks student course, year, and section.
5. System shows only elections matching that student profile.
6. Student opens an election, chooses one candidate, confirms vote.
7. Vote is saved in database (only once).
8. Student can view vote history.
9. Admin logs in to admin portal.
10. Admin creates candidates and elections.
11. Admin sees dashboard stats and election results charts.

## Input -> Process -> Output

### Student registration
- Input: name, email, phone, course, year, section, password.
- Process: app creates auth account + profile in users table.
- Output: student account created.

### Voting
- Input: election id + candidate id.
- Process: database function checks eligibility, time, and duplicate vote.
- Output: vote saved or error message (for example: already voted).

### Admin results
- Input: selected election.
- Process: query vote counts per candidate.
- Output: rankings + bar chart + pie chart.

---

## 3) Technologies Used (Simple explanation)

## Frontend technologies

### React
React is a JavaScript library to build user interfaces.
It lets developers break UI into reusable pieces called components.
When data changes, React updates the screen automatically.
In this project, all pages (login, dashboard, results) are built using React.
Analogy: Lego blocks for UI.

### TypeScript
TypeScript is JavaScript with type safety.
It catches many coding mistakes early.
It makes large projects easier to maintain.
In this project, models like user, election, and vote are strongly typed.
Analogy: labeling every wire in an electrical panel.

### Vite
Vite is the build and development tool.
It starts the app quickly and reloads very fast during coding.
It also creates optimized production build files.
In this project, commands like npm run dev and npm run build use Vite.
Analogy: fast engine for your app.

### Tailwind CSS
Tailwind is a utility-first CSS framework.
Instead of writing long custom CSS, developers use small style classes.
This speeds up responsive UI development.
In this project, many components use Tailwind classes for layout and colors.
Analogy: ready-made style toolkit.

### Framer Motion
Framer Motion is used for smooth animations in React.
It helps page elements fade, move, and animate nicely.
In this project, landing and auth pages use motion effects.
Analogy: animation director for your UI.

### Recharts
Recharts is a chart library for React.
It creates bar charts and pie charts from data.
In this project, admin dashboard and results pages use Recharts.
Analogy: turning numbers into easy-to-read graphs.

### React Hook Form + Zod
React Hook Form handles form state and validation efficiently.
Zod defines validation rules (like email format, min length).
In this project, student/admin forms use this combo.
Analogy: form gatekeeper that checks inputs before allowing submit.

### React Router
React Router handles navigation between pages.
It maps URLs to page components.
In this project, routes like /login, /admin, /home are managed here.
Analogy: road map inside the app.

### Zustand
Zustand is a lightweight state management library.
It stores app-wide data like logged-in user.
In this project, authStore keeps user and loading state.
Analogy: shared memory box for all pages.

## Backend and database technologies

### Supabase
Supabase provides backend services.
It includes PostgreSQL database, authentication, API access, and security policies.
In this project, frontend talks directly to Supabase.
Analogy: ready backend office for your app.

### PostgreSQL
PostgreSQL is a powerful relational database.
Data is stored in tables with relations and constraints.
In this project, users, elections, candidates, votes, and logs are in Postgres tables.
Analogy: smart digital register with strict rules.

### Row Level Security (RLS)
RLS controls who can read/write which rows.
It is applied at database level, not only frontend.
In this project, students see own data, admins can manage more data.
Analogy: bank locker access rules per person.

### SQL Functions (RPC)
Custom SQL functions run secure logic inside database.
Frontend calls them like remote methods.
In this project, cast_vote and result functions are critical.
Analogy: official clerk that validates every vote before accepting it.

---

## 4) Project Structure (Very Important)

## Full tree (app files, excluding dependency/build folders)
~~~text
SecureVote/
  .env.example
  .gitignore
  admin.sql
  DATABASE_README.md
  eslint.config.js
  index.html
  LICENSE
  package-lock.json
  package.json
  postcss.config.js
  README.md
  tailwind.config.ts
  tsconfig.app.json
  tsconfig.json
  tsconfig.node.json
  users.sql
  validate_database.sql
  vercel.json
  vite.config.ts
  PRESENTATION_BEGINNER_GUIDE.md
  public/
    favicon.svg
    icons.svg
    manifest.json
  src/
    App.tsx
    index.css
    main.tsx
    assets/
      hero.png
      react.svg
      vite.svg
    components/
      experience/
        OrbField.tsx
        TiltSurface.tsx
      layout/
        AdminLayout.tsx
        AdminRoute.tsx
        UserLayout.tsx
        UserRoute.tsx
      shared/
        CandidateCard.tsx
        ConfirmDialog.tsx
        ElectionCard.tsx
        EmptyState.tsx
        LoadingPage.tsx
        ProfilePictureModal.tsx
        ResultBar.tsx
        StatusBadge.tsx
        VoteReceiptModal.tsx
      three/
        CardScene.tsx
        FloatingCard.tsx
        VotingAnimation.tsx
        VotingScene.tsx
      ui/
        Avatar.tsx
        Badge.tsx
        BottomSheet.tsx
        Button.tsx
        Card.tsx
        Input.tsx
        Modal.tsx
        ProgressBar.tsx
        Select.tsx
        Skeleton.tsx
        Textarea.tsx
    constants/
      academic.ts
      routes.ts
    hooks/
      useAdminData.ts
      useAuth.ts
      useCandidates.ts
      useElections.ts
      useVotes.ts
    lib/
      cn.ts
      cropImage.ts
      crypto.ts
      dates.ts
      errors.ts
    pages/
      AdminLogin.tsx
      Landing.tsx
      StudentLogin.tsx
      StudentRegistration_NEW.tsx
      StudentRegistration.tsx
      admin/
        AddCandidate.tsx
        Candidates.tsx
        CreateElection.tsx
        Dashboard.tsx
        Elections.tsx
        ManageAdmins.tsx
        Results.tsx
        Students.tsx
      user/
        ElectionDetail.tsx
        Home.tsx
        MyVotes.tsx
        VoteConfirm.tsx
    services/
      auth.service.ts
      candidate.service.ts
      election.service.ts
      mappers.ts
      supabase.service.ts
      user.service.ts
      vote.service.ts
    store/
      authStore.ts
    supabase/
      client.ts
      database.types.ts
    types/
      index.ts
  supabase/
    README.md
    migrations/
      002_add_election_results_functions.sql
~~~

## Folder purpose and what each contains

### public
Static files that browser can load directly (icons, PWA manifest).

### src
Main application code.

### src/assets
Image files used in UI.

### src/components
Reusable UI pieces.
- experience: visual effects components.
- layout: page wrappers and role-based navigation.
- shared: reusable business UI blocks.
- three: 3D scenes/animations.
- ui: basic UI primitives like button, card, input.

### src/constants
App constants like routes and academic metadata.

### src/hooks
Reusable React logic blocks to fetch/manage data.

### src/lib
Small utility helpers (date parsing, class merge, error mapping, etc.).

### src/pages
Actual screens user sees.
- admin: admin portal pages.
- user: student pages.

### src/services
Data-access and business logic layer. Handles Supabase calls.

### src/store
Global app state (auth state).

### src/supabase
Supabase client setup and generated database types.

### src/types
Shared TypeScript type definitions.

### supabase
Database related docs/migrations kept in repository.

## Important files and why they exist

### Root files
- package.json: project metadata, dependencies, scripts.
- vite.config.ts: Vite configuration.
- tailwind.config.ts: Tailwind setup.
- tsconfig*.json: TypeScript compile rules.
- index.html: main HTML shell.
- users.sql: core tables and voting functions.
- admin.sql: admin features and result functions.
- validate_database.sql: checks database setup correctness.
- vercel.json: deployment settings.
- .env.example: sample environment variables.

### Main app startup files
- src/main.tsx: app entry point, mounts React into root div.
- src/App.tsx: route map + auth sync + protected navigation.

### Authentication and state
- src/store/authStore.ts: keeps current user and loading state.
- src/services/auth.service.ts: register/login/logout/profile operations.
- src/components/layout/UserRoute.tsx: blocks unauthorized user routes.
- src/components/layout/AdminRoute.tsx: blocks unauthorized admin routes.

### Voting flow files
- src/pages/user/Home.tsx: student dashboard with eligible elections.
- src/pages/user/ElectionDetail.tsx: election details and candidate list.
- src/pages/user/VoteConfirm.tsx: final vote confirmation and submit.
- src/services/vote.service.ts: cast vote and fetch vote history/results.

### Admin flow files
- src/pages/admin/Dashboard.tsx: overview stats and election charts.
- src/pages/admin/CreateElection.tsx: create election with candidate linking.
- src/pages/admin/Elections.tsx: list/delete elections.
- src/pages/admin/Results.tsx: ranking and visual analytics.
- src/pages/admin/ManageAdmins.tsx: add/remove admin users.

### Data model and mapping
- src/types/index.ts: app-level interfaces and enums.
- src/services/mappers.ts: converts raw DB row shape into app shape.

### Note on legacy file
- src/pages/StudentRegistration_NEW.tsx appears to be an alternative/older file and is not used in routes.

---

## 5) File Extensions Used

### .ts
TypeScript file (logic, utilities, config without JSX UI markup).
Used for services, constants, types, configs.

### .tsx
TypeScript + JSX file (React components/pages with UI).
Used for screens and reusable components.

### .js
JavaScript config files for tools (for example ESLint/PostCSS).

### .json
Structured data/config format.
Used for package metadata, lockfile, manifest, deployment config.

### .sql
Database scripts.
Used to create tables, policies, functions, and validation checks.

### .css
Styling file.
Used in src/index.css for global styles and utility setup.

### .html
Main HTML template loaded by browser (index.html).

### .md
Markdown documentation files (README and this guide).

### .svg and .png
Image assets/icons used in UI.

### .example (in .env.example)
Template file showing required environment variables.

---

## 6) Code Explanation (Beginner Level, key files)

## A) src/main.tsx (very first file that runs)
~~~tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
~~~
What each line does:
- imports React and ReactDOM tools.
- imports App component (main app).
- imports global CSS.
- finds HTML element with id root and mounts React app there.
- StrictMode helps catch bugs in development.

## B) src/App.tsx (route map + auth sync)
Important parts:
1. Uses BrowserRouter and Routes for page navigation.
2. Lazy loads pages for better performance.
3. Registers auth state change listener.
4. Stores logged-in user in authStore.
5. Uses UserRoute and AdminRoute wrappers for access control.

Simple idea:
App.tsx is the traffic controller of the entire app.

## C) src/services/auth.service.ts (register/login)
Key logic:
- registerStudent:
  - creates auth account using supabase.auth.signUp,
  - inserts profile row into users table,
  - logs action in audit_logs.
- signInStudent and signInAdmin:
  - password login,
  - fetch profile,
  - role check (student/admin),
  - reject wrong role access.
- getUserProfile: reads profile from users table.
- onAuthChange: listens to login/logout changes.

Simple idea:
This file is the gatekeeper for account operations.

## D) src/services/vote.service.ts (most important voting logic)
Key logic:
- castVote calls SQL RPC cast_vote.
- If DB returns specific errors (not eligible, ended, already voted), app shows friendly message.
- getUserVotesDetailed merges vote records with election/candidate names.
- getElectionResults and getTotalVotesForElection call admin SQL functions.

Simple idea:
Frontend does not trust itself for security; database function enforces rules.

## E) users.sql (database-level security)
Core points:
- creates users, candidates, elections, election_candidates, votes tables.
- unique constraint on (user_id, election_id) prevents double voting.
- cast_vote SQL function checks:
  - user exists,
  - election exists,
  - eligibility (course/year/section),
  - time window,
  - duplicate vote,
  - candidate belongs to election.
- RLS policies protect table access.

Simple idea:
Even if someone tries to cheat from frontend, database rules stop it.

## F) admin.sql (admin-only result functions)
Core points:
- creates audit_logs table.
- defines get_election_results, get_election_vote_count, get_total_vote_count.
- each function checks is_admin first.
- adds admin-level RLS policies.
- includes helper functions for admin management.

Simple idea:
Admin analytics are secured in DB itself, not only hidden in UI.

## G) src/pages/user/VoteConfirm.tsx (final vote screen)
Flow:
1. Reads electionId and candidateId from URL.
2. Loads election and candidate data.
3. On confirm click, calls castVote.
4. Shows success animation and redirects.

Simple idea:
This is the final submit page like final payment confirmation page.

---

## 7) How to Run the Project (Step-by-step)

## Prerequisites
- Node.js installed
- npm available
- Supabase project ready

## Step 1: Install packages
~~~bash
npm install
~~~
What happens:
- npm reads package.json.
- downloads all libraries into node_modules.

## Step 2: Create environment file
Create a .env file in project root with:
~~~env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
~~~
What happens:
- app gets backend URL and anon key at build/run time.

## Step 3: Setup database
Run SQL scripts in Supabase SQL Editor in this order:
1. users.sql
2. admin.sql
3. validate_database.sql (optional but recommended)

What happens:
- creates tables, functions, policies, indexes.
- validates setup and prints notices.

## Step 4: Start development server
~~~bash
npm run dev
~~~
What happens:
- starts Vite server.
- app usually opens at http://localhost:5173 (sometimes another free port).

## Step 5: Build production bundle
~~~bash
npm run build
~~~
What happens:
- TypeScript compile check.
- optimized static files generated in dist.

## Step 6: Preview production build locally
~~~bash
npm run preview
~~~
What happens:
- serves built files from dist for final testing.

---

## 8) Database Explanation

## Main tables

### users
Stores student/admin profile data.
Important fields:
- id (linked to auth.users id)
- email, full_name
- course, year, section
- role (student/admin)
- is_active

### candidates
Stores candidate profiles.
Fields include name, description, course/year/section.

### elections
Stores each election event.
Includes title, description, eligible course/year/section, start_time, end_time.

### election_candidates
Junction table linking many candidates to one election.

### votes
Stores actual cast votes.
Important rule: unique (user_id, election_id) so one person cannot vote twice.

### audit_logs
Stores system activities for tracking and debugging.

## Relationships
- users 1 -> many elections (created_by for admin-created elections)
- elections many <-> many candidates (through election_candidates)
- users 1 -> many votes
- elections 1 -> many votes
- candidates 1 -> many votes

## Why database is needed
Without DB, app cannot safely:
- store users,
- enforce voting rules,
- prevent duplicate votes,
- generate trustworthy results.

---

## 9) Authentication and APIs (simple)

## Authentication
Supabase Auth handles login/signup.
- Student login uses email + password.
- Admin login uses same auth system but role must be admin in users table.

## Behind the scenes when login happens
1. User enters email/password.
2. Supabase verifies credentials.
3. App fetches profile from users table.
4. App checks role and redirects to correct dashboard.

## API style used
No separate Express or Django backend here.
Frontend directly calls Supabase using:
- table operations (select, insert, update, delete)
- RPC calls to SQL functions (cast_vote, get_election_results)

Why RPC is important:
Security checks live inside database function, not only frontend.

---

## 10) Key Features of the Project

1. Student registration with complete academic details.
2. Separate student and admin login portals.
3. Role-based route protection.
4. Course/year/section-based election eligibility.
5. One vote per student per election.
6. Time-window voting (only during active election).
7. Candidate management by admin.
8. Election creation and candidate assignment.
9. Student vote history page.
10. Admin dashboard with summary stats.
11. Admin results page with rankings + charts.
12. Audit logging for important actions.
13. Responsive UI for desktop and mobile.
14. Some 3D visual effects for better UI experience.

---

## 11) Possible Presentation Questions with Simple Answers

Q1. What is the main purpose of SecureVote?
A: It is a digital voting platform for colleges where students can vote securely and admins can manage elections.

Q2. How is this better than paper voting?
A: It is faster, reduces counting mistakes, enforces one vote per student, and gives instant analytics.

Q3. How do you stop duplicate voting?
A: The votes table has a unique constraint on user_id + election_id, and cast_vote function checks before insert.

Q4. How do you ensure only eligible students vote?
A: The database function compares student course/year/section with election eligibility before accepting the vote.

Q5. Why did you use Supabase?
A: It gives authentication, PostgreSQL database, API, and security policies in one platform, so development is faster.

Q6. What is RLS and why is it important?
A: Row Level Security controls which rows each user can access. It protects data directly at database level.

Q7. What is the role of App.tsx?
A: It is the central router and auth synchronizer. It decides which page loads for each route and user role.

Q8. How are admin results generated?
A: Admin page calls secure SQL RPC functions that count votes candidate-wise and return analytics data.

Q9. Which part is responsible for frontend forms validation?
A: React Hook Form + Zod validates form inputs like email format, password length, and required fields.

Q10. How do you deploy this project?
A: Build with npm run build and deploy static frontend (for example on Vercel) with Supabase environment variables.

Q11. What are the main tables in database?
A: users, candidates, elections, election_candidates, votes, audit_logs.

Q12. If internet fails during vote, what happens?
A: Vote call fails and user gets error. Since final write happens in DB function, no partial local fake success is accepted.

Q13. Is there any backend server code in this repo?
A: No separate custom backend server. Supabase acts as backend.

Q14. What is the use of mappers.ts?
A: It converts raw database field names into clean app object format used by UI.

Q15. What is one thing you would improve next?
A: Add automated tests and improve admin creation flow to remove manual fallback steps.

---

## 12) 1-2 Minute Presentation Script (Speak this)

Hello everyone.
This project is called SecureVote.
It is a college-level digital voting system.
The main goal is to make elections secure, fast, and easy to manage.

In traditional voting, there are problems like manual counting, eligibility confusion, and delayed results.
SecureVote solves these issues using a web app with role-based access.
Students can register, log in, see only eligible elections, and cast exactly one vote.
Admins can create elections, manage candidates, and view real-time results through charts.

Technically, the frontend is built with React, TypeScript, and Tailwind CSS.
The backend services are handled by Supabase, which provides authentication and PostgreSQL database.
A key security feature is Row Level Security and SQL functions like cast_vote.
This ensures that even if someone tries to bypass the UI, database rules still protect the system.

The database has six core tables: users, elections, candidates, election_candidates, votes, and audit_logs.
The votes table and SQL checks enforce one vote per user per election.

Overall, SecureVote demonstrates a full modern web application with authentication, secure database design, role-based flows, and analytics.
Thank you.

---

## Quick Revision Checklist (Before Presentation)

- Understand student flow: register -> login -> eligible elections -> vote.
- Understand admin flow: login -> create candidates/elections -> view results.
- Remember security points: unique vote rule, eligibility checks, RLS.
- Remember core stack: React + TypeScript + Supabase + PostgreSQL.
- Remember 6 database tables and why each exists.

Good luck for your presentation.
