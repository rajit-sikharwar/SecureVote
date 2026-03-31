-- Fix RLS policies for votes table to ensure admin results work correctly

-- Drop existing policies for votes table
DROP POLICY IF EXISTS "Users can read their own votes" ON public.votes;
DROP POLICY IF EXISTS "Admins can read all votes" ON public.votes;

-- Recreate policies with explicit permissions for admin results
CREATE POLICY "Users can read their own votes"
ON public.votes
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can read all votes"
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

-- Add a policy that specifically allows vote counting for election results
CREATE POLICY "Allow election results aggregation"
ON public.votes
FOR SELECT
USING (
  -- Always allow counting votes for election results when user is admin
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_active = true
  )
);

-- Ensure the is_admin function works correctly
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;