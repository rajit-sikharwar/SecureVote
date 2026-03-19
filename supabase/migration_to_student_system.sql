-- Migration: Update existing schema to student-focused system
-- Run this in your Supabase SQL Editor

-- Step 1: Backup existing data (if any)
-- This creates a backup of existing users before migration
CREATE TEMPORARY TABLE users_backup AS SELECT * FROM public.users;

-- Step 2: Add new columns to existing users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS college_name text,
ADD COLUMN IF NOT EXISTS enrollment_number text UNIQUE,
ADD COLUMN IF NOT EXISTS roll_number text,
ADD COLUMN IF NOT EXISTS admission_year integer,
ADD COLUMN IF NOT EXISTS course text CHECK (course IN ('BCA', 'BBA', 'B.Tech', 'MBA', 'MCA', 'BA', 'B.Com', 'M.Tech')),
ADD COLUMN IF NOT EXISTS year integer CHECK (year BETWEEN 1 AND 4),
ADD COLUMN IF NOT EXISTS section text CHECK (section IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J')),
ADD COLUMN IF NOT EXISTS photo_url text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Step 3: Update role constraint to include 'student'
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'student'));

-- Step 4: Remove old category-related columns (if they exist)
ALTER TABLE public.users DROP COLUMN IF EXISTS category;
ALTER TABLE public.users DROP COLUMN IF EXISTS registered_at;

-- Step 5: Rename full_name column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users RENAME COLUMN name TO full_name;
    END IF;
EXCEPTION
    WHEN others THEN
        -- Column might already be named full_name
        NULL;
END $$;

-- Step 6: Ensure full_name column exists
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS full_name text NOT NULL DEFAULT '';

-- Step 7: Update/Create candidates table for new structure
DROP TABLE IF EXISTS public.candidates CASCADE;
CREATE TABLE public.candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  photo_url text,
  description text NOT NULL,
  course text NOT NULL CHECK (course IN ('BCA', 'BBA', 'B.Tech', 'MBA', 'MCA', 'BA', 'B.Com', 'M.Tech')),
  year integer NOT NULL CHECK (year BETWEEN 1 AND 4),
  section text NOT NULL CHECK (section IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Step 8: Update/Create elections table for new structure
DROP TABLE IF EXISTS public.elections CASCADE;
CREATE TABLE public.elections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  course text NOT NULL CHECK (course IN ('BCA', 'BBA', 'B.Tech', 'MBA', 'MCA', 'BA', 'B.Com', 'M.Tech')),
  year integer NOT NULL CHECK (year BETWEEN 1 AND 4),
  section text NOT NULL CHECK (section IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J')),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_by uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE
);

-- Step 9: Create election_candidates junction table
DROP TABLE IF EXISTS public.election_candidates CASCADE;
CREATE TABLE public.election_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid NOT NULL REFERENCES public.elections (id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  UNIQUE (election_id, candidate_id)
);

-- Step 10: Update/Create votes table for new structure
DROP TABLE IF EXISTS public.votes CASCADE;
CREATE TABLE public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  election_id uuid NOT NULL REFERENCES public.elections (id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (user_id, election_id)
);

-- Step 11: Create/Update audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  performed_by uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  target_id text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT timezone('utc', now()),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Step 12: Remove old tables that are no longer needed
DROP TABLE IF EXISTS public.registrations CASCADE;

-- Step 13: Create the secure vote casting function
CREATE OR REPLACE FUNCTION public.cast_vote(
  p_user_id uuid,
  p_election_id uuid,
  p_candidate_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_course text;
  v_user_year integer;
  v_user_section text;
  v_election_course text;
  v_election_year integer;
  v_election_section text;
  v_start_time timestamptz;
  v_end_time timestamptz;
  v_now timestamptz := timezone('utc', now());
BEGIN
  -- Get user details
  SELECT course, year, section
  INTO v_user_course, v_user_year, v_user_section
  FROM public.users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Get election details
  SELECT course, year, section, start_time, end_time
  INTO v_election_course, v_election_year, v_election_section, v_start_time, v_end_time
  FROM public.elections
  WHERE id = p_election_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Election not found';
  END IF;

  -- Check eligibility
  IF v_user_course != v_election_course OR v_user_year != v_election_year OR v_user_section != v_election_section THEN
    RAISE EXCEPTION 'You are not eligible to vote in this election';
  END IF;

  -- Check time window
  IF v_now < v_start_time THEN
    RAISE EXCEPTION 'Election has not started yet';
  END IF;

  IF v_now > v_end_time THEN
    RAISE EXCEPTION 'Election has ended';
  END IF;

  -- Check if already voted
  IF EXISTS (SELECT 1 FROM public.votes WHERE user_id = p_user_id AND election_id = p_election_id) THEN
    RAISE EXCEPTION 'You have already voted in this election';
  END IF;

  -- Check if candidate belongs to this election
  IF NOT EXISTS (SELECT 1 FROM public.election_candidates WHERE election_id = p_election_id AND candidate_id = p_candidate_id) THEN
    RAISE EXCEPTION 'Invalid candidate for this election';
  END IF;

  -- Insert vote
  INSERT INTO public.votes (user_id, election_id, candidate_id)
  VALUES (p_user_id, p_election_id, p_candidate_id);

  -- Log the action
  INSERT INTO public.audit_logs (action, performed_by, target_id, metadata)
  VALUES (
    'vote_cast',
    p_user_id,
    p_election_id::text,
    jsonb_build_object('candidateId', p_candidate_id)
  );
END;
$$;

-- Step 14: Create helper function
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = p_user_id
      AND role = 'admin'
      AND is_active = true
  );
$$;

-- Step 15: Enable Row Level Security and create policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile or admins can view all" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile or admins can view all"
ON public.users
FOR SELECT
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id AND role = 'student');

CREATE POLICY "Admins can manage all users"
ON public.users
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- RLS Policies for candidates table
CREATE POLICY "Authenticated users can read candidates"
ON public.candidates
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage candidates"
ON public.candidates
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- RLS Policies for elections table
CREATE POLICY "Authenticated users can read elections"
ON public.elections
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage elections"
ON public.elections
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- RLS Policies for election_candidates table
CREATE POLICY "Authenticated users can read election candidates"
ON public.election_candidates
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage election candidates"
ON public.election_candidates
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- RLS Policies for votes table
CREATE POLICY "Users can read their own votes"
ON public.votes
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can read all votes"
ON public.votes
FOR SELECT
USING (public.is_admin());

-- RLS Policies for audit logs
CREATE POLICY "Admins can read audit logs"
ON public.audit_logs
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Users can insert audit logs for themselves"
ON public.audit_logs
FOR INSERT
WITH CHECK (performed_by = auth.uid());

-- Step 16: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.cast_vote(uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Step 17: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_enrollment ON public.users (enrollment_number);
CREATE INDEX IF NOT EXISTS idx_users_course_year_section ON public.users (course, year, section);
CREATE INDEX IF NOT EXISTS idx_candidates_course_year_section ON public.candidates (course, year, section);
CREATE INDEX IF NOT EXISTS idx_elections_course_year_section ON public.elections (course, year, section);
CREATE INDEX IF NOT EXISTS idx_elections_time ON public.elections (start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_votes_user_election ON public.votes (user_id, election_id);
CREATE INDEX IF NOT EXISTS idx_votes_election ON public.votes (election_id);
CREATE INDEX IF NOT EXISTS idx_election_candidates_election ON public.election_candidates (election_id);

-- Migration completed successfully!