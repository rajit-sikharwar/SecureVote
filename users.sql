-- ============================================
-- SecureVote - User Database Schema
-- ============================================
-- Contains all tables, functions, and policies
-- related to user operations and voting
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLES
-- ============================================

-- Users table with complete student academic information
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  address TEXT NOT NULL,
  college_name TEXT NOT NULL,
  enrollment_number TEXT NOT NULL UNIQUE,
  roll_number TEXT NOT NULL,
  admission_year INTEGER NOT NULL,
  course TEXT NOT NULL CHECK (course IN ('BCA', 'BBA', 'B.Tech', 'MBA', 'MCA', 'BA', 'B.Com', 'M.Tech')),
  year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 4),
  section TEXT NOT NULL CHECK (section IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J')),
  photo_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'student')) DEFAULT 'student',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Candidates table (admin creates candidate profiles)
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  photo_url TEXT,
  description TEXT NOT NULL,
  course TEXT NOT NULL CHECK (course IN ('BCA', 'BBA', 'B.Tech', 'MBA', 'MCA', 'BA', 'B.Com', 'M.Tech')),
  year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 4),
  section TEXT NOT NULL CHECK (section IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Elections table with eligibility based on course, year, section
CREATE TABLE IF NOT EXISTS public.elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  course TEXT NOT NULL CHECK (course IN ('BCA', 'BBA', 'B.Tech', 'MBA', 'MCA', 'BA', 'B.Com', 'M.Tech')),
  year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 4),
  section TEXT NOT NULL CHECK (section IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE
);

-- Election candidates many-to-many relationship
CREATE TABLE IF NOT EXISTS public.election_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections (id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  UNIQUE (election_id, candidate_id)
);

-- Votes table with constraint: one vote per user per election
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  election_id UUID NOT NULL REFERENCES public.elections (id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE (user_id, election_id)
);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = COALESCE(p_user_id, auth.uid())
      AND role = 'admin'
      AND is_active = true
  );
$$;

-- ============================================
-- VOTING FUNCTIONS
-- ============================================

-- Function to cast vote with security checks
CREATE OR REPLACE FUNCTION public.cast_vote(
  p_user_id UUID,
  p_election_id UUID,
  p_candidate_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_course TEXT;
  v_user_year INTEGER;
  v_user_section TEXT;
  v_election_course TEXT;
  v_election_year INTEGER;
  v_election_section TEXT;
  v_start_time TIMESTAMPTZ;
  v_end_time TIMESTAMPTZ;
  v_now TIMESTAMPTZ := TIMEZONE('utc', NOW());
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
    p_election_id::TEXT,
    jsonb_build_object('candidateId', p_candidate_id)
  );
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
DROP POLICY IF EXISTS "Users can view their own profile or admins can view all" ON public.users;
CREATE POLICY "Users can view their own profile or admins can view all"
ON public.users
FOR SELECT
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
CREATE POLICY "Users can create their own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id AND role = 'student');

-- RLS Policies for candidates table
DROP POLICY IF EXISTS "Authenticated users can read candidates" ON public.candidates;
CREATE POLICY "Authenticated users can read candidates"
ON public.candidates
FOR SELECT
USING (auth.role() = 'authenticated');

-- RLS Policies for elections table
DROP POLICY IF EXISTS "Authenticated users can read elections" ON public.elections;
CREATE POLICY "Authenticated users can read elections"
ON public.elections
FOR SELECT
USING (auth.role() = 'authenticated');

-- RLS Policies for election_candidates table
DROP POLICY IF EXISTS "Authenticated users can read election candidates" ON public.election_candidates;
CREATE POLICY "Authenticated users can read election candidates"
ON public.election_candidates
FOR SELECT
USING (auth.role() = 'authenticated');

-- RLS Policies for votes table
DROP POLICY IF EXISTS "Users can read their own votes" ON public.votes;
CREATE POLICY "Users can read their own votes"
ON public.votes
FOR SELECT
USING (user_id = auth.uid());

-- ============================================
-- GRANTS
-- ============================================

GRANT EXECUTE ON FUNCTION public.cast_vote(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_enrollment ON public.users (enrollment_number);
CREATE INDEX IF NOT EXISTS idx_users_course_year_section ON public.users (course, year, section);
CREATE INDEX IF NOT EXISTS idx_candidates_course_year_section ON public.candidates (course, year, section);
CREATE INDEX IF NOT EXISTS idx_elections_course_year_section ON public.elections (course, year, section);
CREATE INDEX IF NOT EXISTS idx_elections_time ON public.elections (start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_votes_user_election ON public.votes (user_id, election_id);
CREATE INDEX IF NOT EXISTS idx_votes_election ON public.votes (election_id);
CREATE INDEX IF NOT EXISTS idx_election_candidates_election ON public.election_candidates (election_id);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✓ Users schema created successfully!';
  RAISE NOTICE '  - Tables: users, candidates, elections, election_candidates, votes';
  RAISE NOTICE '  - Functions: is_admin(), cast_vote()';
  RAISE NOTICE '  - RLS policies enabled and configured';
END $$;
