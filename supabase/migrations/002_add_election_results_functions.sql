-- Migration: Add secure functions for fetching election results
-- This bypasses RLS to ensure admins can always see vote counts
-- Run this in your Supabase SQL Editor

-- Drop existing functions if they exist (for idempotency)
DROP FUNCTION IF EXISTS public.get_election_results(uuid);
DROP FUNCTION IF EXISTS public.get_election_vote_count(uuid);

-- Function to get election results (admin only, bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_election_results(p_election_id uuid)
RETURNS TABLE (
  candidate_id uuid,
  candidate_name text,
  photo_url text,
  vote_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT
    c.id AS candidate_id,
    c.name AS candidate_name,
    c.photo_url,
    COALESCE(COUNT(v.id), 0)::bigint AS vote_count
  FROM election_candidates ec
  JOIN candidates c ON c.id = ec.candidate_id
  LEFT JOIN votes v ON v.candidate_id = c.id AND v.election_id = p_election_id
  WHERE ec.election_id = p_election_id
  GROUP BY c.id, c.name, c.photo_url
  ORDER BY vote_count DESC, c.name;
END;
$$;

-- Function to get total vote count for an election (admin only)
CREATE OR REPLACE FUNCTION public.get_election_vote_count(p_election_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count bigint;
BEGIN
  -- Verify caller is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM votes
  WHERE election_id = p_election_id;

  RETURN COALESCE(v_count, 0);
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_election_results(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_election_vote_count(uuid) TO authenticated;

-- Also ensure the is_admin function exists and is correct
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
    WHERE id = COALESCE(p_user_id, auth.uid())
      AND role = 'admin'
      AND is_active = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Verify the admin RLS policy exists for votes table
DO $$
BEGIN
  -- Drop and recreate to ensure correct policy
  DROP POLICY IF EXISTS "Admins can read all votes for results" ON public.votes;
  DROP POLICY IF EXISTS "Admins can read all votes" ON public.votes;
  
  CREATE POLICY "Admins can read all votes for results"
  ON public.votes
  FOR SELECT
  USING (public.is_admin());
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not update votes policy: %', SQLERRM;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Election results functions created successfully!';
  RAISE NOTICE 'Functions: get_election_results(uuid), get_election_vote_count(uuid)';
END $$;
