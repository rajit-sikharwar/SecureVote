-- ============================================
-- SecureVote - Admin Database Schema
-- ============================================
-- Contains all tables, functions, and policies
-- related to administrative operations
-- ============================================

-- ============================================
-- TABLES
-- ============================================

-- Audit logs for tracking actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  performed_by UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  target_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- ============================================
-- ADMIN RESULT FUNCTIONS
-- ============================================

-- Function to get election results (admin only, bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_election_results(p_election_id UUID)
RETURNS TABLE (
  candidate_id UUID,
  candidate_name TEXT,
  photo_url TEXT,
  vote_count BIGINT
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
    COALESCE(COUNT(v.id), 0)::BIGINT AS vote_count
  FROM election_candidates ec
  JOIN candidates c ON c.id = ec.candidate_id
  LEFT JOIN votes v ON v.candidate_id = c.id AND v.election_id = p_election_id
  WHERE ec.election_id = p_election_id
  GROUP BY c.id, c.name, c.photo_url
  ORDER BY vote_count DESC, c.name;
END;
$$;

-- Function to get total vote count for an election (admin only)
CREATE OR REPLACE FUNCTION public.get_election_vote_count(p_election_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count BIGINT;
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

-- Function to get total vote count across all elections (admin only)
CREATE OR REPLACE FUNCTION public.get_total_vote_count()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count BIGINT;
BEGIN
  -- Verify caller is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM votes;

  RETURN COALESCE(v_count, 0);
END;
$$;

-- ============================================
-- ADMIN MANAGEMENT FUNCTIONS
-- ============================================

-- Function to create a new admin user
CREATE OR REPLACE FUNCTION public.create_admin_user(
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT DEFAULT '+1234567890',
  p_college_name TEXT DEFAULT 'SecureVote College'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_current_user_role TEXT;
BEGIN
  -- Check if current user is admin
  SELECT role INTO v_current_user_role
  FROM public.users
  WHERE id = auth.uid();

  IF v_current_user_role != 'admin' THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Unauthorized: Admin access required'
    );
  END IF;

  -- Create admin user record
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    phone,
    date_of_birth,
    gender,
    address,
    college_name,
    enrollment_number,
    roll_number,
    admission_year,
    course,
    year,
    section,
    is_active
  ) VALUES (
    gen_random_uuid(),
    p_email,
    p_full_name,
    'admin',
    p_phone,
    '1990-01-01',
    'other',
    'Admin Office',
    p_college_name,
    'ADMIN-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
    'ADMIN',
    EXTRACT(YEAR FROM NOW())::INTEGER,
    'BCA',
    1,
    'A',
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    full_name = p_full_name,
    is_active = true
  RETURNING id INTO v_admin_id;

  -- Log the action
  INSERT INTO public.audit_logs (action, performed_by, target_id, metadata)
  VALUES (
    'admin_created',
    auth.uid(),
    v_admin_id::TEXT,
    jsonb_build_object('email', p_email, 'name', p_full_name)
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Admin user created successfully',
    'admin_id', v_admin_id
  );
END;
$$;

-- Function to deactivate a user (soft delete)
CREATE OR REPLACE FUNCTION public.deactivate_user(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_role TEXT;
BEGIN
  -- Check if current user is admin
  SELECT role INTO v_current_user_role
  FROM public.users
  WHERE id = auth.uid();

  IF v_current_user_role != 'admin' THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Unauthorized: Admin access required'
    );
  END IF;

  -- Deactivate user
  UPDATE public.users
  SET is_active = false
  WHERE id = p_user_id;

  -- Log the action
  INSERT INTO public.audit_logs (action, performed_by, target_id, metadata)
  VALUES (
    'user_deactivated',
    auth.uid(),
    p_user_id::TEXT,
    '{}'::jsonb
  );

  RETURN json_build_object(
    'success', true,
    'message', 'User deactivated successfully'
  );
END;
$$;

-- Function to clear all user sessions (admin only)
CREATE OR REPLACE FUNCTION public.clear_all_sessions()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sessions_cleared INTEGER;
BEGIN
  -- Check if current user is admin
  IF NOT public.is_admin() THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Unauthorized: Admin access required'
    );
  END IF;

  -- Clear sessions
  DELETE FROM auth.sessions;
  GET DIAGNOSTICS v_sessions_cleared = ROW_COUNT;

  -- Clear refresh tokens
  DELETE FROM auth.refresh_tokens;

  RETURN json_build_object(
    'success', true,
    'message', 'All sessions cleared successfully',
    'sessions_cleared', v_sessions_cleared
  );
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit logs
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_logs;
CREATE POLICY "Admins can read audit logs"
ON public.audit_logs
FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Users can insert audit logs for themselves" ON public.audit_logs;
CREATE POLICY "Users can insert audit logs for themselves"
ON public.audit_logs
FOR INSERT
WITH CHECK (performed_by = auth.uid());

-- Admin policies for user management
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users"
ON public.users
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admin policies for candidates
DROP POLICY IF EXISTS "Admins can manage candidates" ON public.candidates;
CREATE POLICY "Admins can manage candidates"
ON public.candidates
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admin policies for elections
DROP POLICY IF EXISTS "Admins can manage elections" ON public.elections;
CREATE POLICY "Admins can manage elections"
ON public.elections
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admin policies for election_candidates
DROP POLICY IF EXISTS "Admins can manage election candidates" ON public.election_candidates;
CREATE POLICY "Admins can manage election candidates"
ON public.election_candidates
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Enhanced admin policy for vote results
DROP POLICY IF EXISTS "Admins can read all votes for results" ON public.votes;
CREATE POLICY "Admins can read all votes for results"
ON public.votes
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_active = true
  )
);

-- ============================================
-- GRANTS
-- ============================================

GRANT EXECUTE ON FUNCTION public.get_election_results(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_election_vote_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_total_vote_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_user(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deactivate_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_all_sessions() TO authenticated;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON public.audit_logs (performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);

-- ============================================
-- CREATE FIRST ADMIN USER
-- ============================================
-- IMPORTANT: You must create an admin user manually after running this script.
-- The users.id field references auth.users(id), so you need a real authenticated user.
--
-- Option 1: Use Supabase Dashboard
-- 1. Go to Authentication → Users
-- 2. Create a new user (or use existing user)
-- 3. Copy the user's UUID
-- 4. Run this SQL (replace the UUID and email):
--
-- INSERT INTO public.users (
--   id,
--   email,
--   full_name,
--   role,
--   phone,
--   date_of_birth,
--   gender,
--   address,
--   college_name,
--   enrollment_number,
--   roll_number,
--   admission_year,
--   course,
--   year,
--   section,
--   is_active
-- ) VALUES (
--   'YOUR-USER-UUID-FROM-AUTH-USERS',  -- ⚠️ REPLACE WITH REAL UUID
--   'your-email@example.com',           -- ⚠️ REPLACE WITH YOUR EMAIL
--   'System Administrator',
--   'admin',
--   '+1234567890',
--   '1990-01-01',
--   'other',
--   'Admin Office',
--   'SecureVote College',
--   'ADMIN-001',
--   'ADMIN',
--   EXTRACT(YEAR FROM NOW())::INTEGER,
--   'BCA',
--   1,
--   'A',
--   true
-- ) ON CONFLICT (email) DO UPDATE SET
--   role = 'admin',
--   is_active = true;
--
-- Option 2: After first user signs up via your app
-- 1. Let a user register normally through your application
-- 2. Find their UUID in auth.users table
-- 3. Update their role to admin:
--
-- UPDATE public.users 
-- SET role = 'admin', is_active = true 
-- WHERE email = 'their-email@example.com';
--
-- Option 3: Use the create_admin_user function (after you have at least one admin)
-- SELECT create_admin_user('new-admin@example.com', 'Admin Name', '+1234567890', 'College Name');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✓ Admin schema created successfully!';
  RAISE NOTICE '  - Tables: audit_logs';
  RAISE NOTICE '  - Functions: get_election_results(), get_election_vote_count(), get_total_vote_count()';
  RAISE NOTICE '  - Admin management: create_admin_user(), deactivate_user(), clear_all_sessions()';
  RAISE NOTICE '  - RLS policies configured for admin access';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  NEXT STEP: Create your first admin user';
  RAISE NOTICE '   See instructions in the CREATE FIRST ADMIN USER section above';
  RAISE NOTICE '';
END $$;
