-- Fixed Safe Migration: Update existing schema to student-focused system
-- This version fixes the voter_id/user_id column mismatch
-- Run this in your Supabase SQL Editor

-- Step 1: Backup existing data (if any)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users_backup') THEN
        DROP TABLE users_backup;
    END IF;

    CREATE TEMPORARY TABLE users_backup AS SELECT * FROM public.users;
END $$;

-- Step 2: Add new columns to existing users table (safe - handles existing columns)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS college_name text,
ADD COLUMN IF NOT EXISTS enrollment_number text,
ADD COLUMN IF NOT EXISTS roll_number text,
ADD COLUMN IF NOT EXISTS admission_year integer,
ADD COLUMN IF NOT EXISTS course text,
ADD COLUMN IF NOT EXISTS year integer,
ADD COLUMN IF NOT EXISTS section text,
ADD COLUMN IF NOT EXISTS photo_url text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- Step 3: Update constraints (drop and recreate to avoid conflicts)
DO $$
BEGIN
    -- Remove old constraints if they exist
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_gender_check;
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_course_check;
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_year_check;
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_section_check;

    -- Add new constraints
    ALTER TABLE public.users ADD CONSTRAINT users_role_check
        CHECK (role IN ('admin', 'student'));
    ALTER TABLE public.users ADD CONSTRAINT users_gender_check
        CHECK (gender IN ('male', 'female', 'other'));
    ALTER TABLE public.users ADD CONSTRAINT users_course_check
        CHECK (course IN ('BCA', 'BBA', 'B.Tech', 'MBA', 'MCA', 'BA', 'B.Com', 'M.Tech'));
    ALTER TABLE public.users ADD CONSTRAINT users_year_check
        CHECK (year BETWEEN 1 AND 4);
    ALTER TABLE public.users ADD CONSTRAINT users_section_check
        CHECK (section IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'));

    -- Add unique constraint if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'users_enrollment_number_key') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_enrollment_number_key UNIQUE (enrollment_number);
    END IF;
END $$;

-- Step 4: Remove old category-related columns (if they exist)
ALTER TABLE public.users DROP COLUMN IF EXISTS category;
ALTER TABLE public.users DROP COLUMN IF EXISTS registered_at;

-- Step 5: Create elections table (if not exists)
CREATE TABLE IF NOT EXISTS public.elections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    course text NOT NULL CHECK (course IN ('BCA', 'BBA', 'B.Tech', 'MBA', 'MCA', 'BA', 'B.Com', 'M.Tech')),
    year integer NOT NULL CHECK (year BETWEEN 1 AND 4),
    section text NOT NULL CHECK (section IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J')),
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_by uuid REFERENCES public.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    total_votes integer DEFAULT 0,

    CONSTRAINT elections_start_end_check CHECK (start_date < end_date)
);

-- Step 6: Create candidates table (if not exists)
CREATE TABLE IF NOT EXISTS public.candidates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name text NOT NULL,
    bio text,
    department text,
    course text NOT NULL CHECK (course IN ('BCA', 'BBA', 'B.Tech', 'MBA', 'MCA', 'BA', 'B.Com', 'M.Tech')),
    year integer NOT NULL CHECK (year BETWEEN 1 AND 4),
    section text NOT NULL CHECK (section IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J')),
    photo_url text,
    manifesto text,
    vote_count integer DEFAULT 0,
    added_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    added_at timestamp with time zone DEFAULT now()
);

-- Step 7: Create election_candidates junction table (if not exists)
CREATE TABLE IF NOT EXISTS public.election_candidates (
    election_id uuid REFERENCES public.elections(id) ON DELETE CASCADE,
    candidate_id uuid REFERENCES public.candidates(id) ON DELETE CASCADE,
    PRIMARY KEY (election_id, candidate_id)
);

-- Step 8: Create votes table (if not exists) - FIXED COLUMN NAMES
CREATE TABLE IF NOT EXISTS public.votes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    election_id uuid REFERENCES public.elections(id) ON DELETE CASCADE,
    candidate_id uuid REFERENCES public.candidates(id) ON DELETE CASCADE,
    receipt_hash text UNIQUE NOT NULL,
    casted_at timestamp with time zone DEFAULT now(),

    UNIQUE(user_id, election_id) -- One vote per voter per election
);

-- Step 9: Create audit_logs table (if not exists)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    action text NOT NULL,
    performed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    target_id uuid,
    metadata jsonb DEFAULT '{}',
    timestamp timestamp with time zone DEFAULT now()
);

-- Step 10: Create secure voting function (replace if exists)
CREATE OR REPLACE FUNCTION public.cast_vote_secure(
    p_user_id uuid,
    p_election_id uuid,
    p_candidate_id uuid
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    election_record public.elections;
    user_record public.users;
    existing_vote public.votes;
    receipt_hash text;
BEGIN
    -- Get election details
    SELECT * INTO election_record FROM public.elections WHERE id = p_election_id;
    IF election_record IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Election not found');
    END IF;

    -- Get user details
    SELECT * INTO user_record FROM public.users WHERE id = p_user_id;
    IF user_record IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'User not found');
    END IF;

    -- Check if user is eligible (course, year, section match)
    IF user_record.course != election_record.course OR
       user_record.year != election_record.year OR
       user_record.section != election_record.section THEN
        RETURN json_build_object('success', false, 'message', 'You are not eligible for this election');
    END IF;

    -- Check if election is active
    IF NOW() < election_record.start_date THEN
        RETURN json_build_object('success', false, 'message', 'Election has not started yet');
    END IF;

    IF NOW() > election_record.end_date THEN
        RETURN json_build_object('success', false, 'message', 'Election has ended');
    END IF;

    -- Check if user has already voted (FIXED COLUMN NAME)
    SELECT * INTO existing_vote FROM public.votes
    WHERE user_id = p_user_id AND election_id = p_election_id;

    IF existing_vote IS NOT NULL THEN
        RETURN json_build_object('success', false, 'message', 'You have already voted in this election');
    END IF;

    -- Generate receipt hash
    receipt_hash := encode(digest(p_user_id::text || p_election_id::text || NOW()::text, 'sha256'), 'hex');

    -- Cast vote (FIXED COLUMN NAME)
    INSERT INTO public.votes (user_id, election_id, candidate_id, receipt_hash)
    VALUES (p_user_id, p_election_id, p_candidate_id, receipt_hash);

    -- Update vote count
    UPDATE public.candidates SET vote_count = vote_count + 1 WHERE id = p_candidate_id;
    UPDATE public.elections SET total_votes = total_votes + 1 WHERE id = p_election_id;

    -- Log the action
    INSERT INTO public.audit_logs (action, performed_by, target_id, metadata)
    VALUES ('vote_cast', p_user_id, p_election_id,
            json_build_object('candidate_id', p_candidate_id, 'receipt_hash', receipt_hash));

    RETURN json_build_object(
        'success', true,
        'message', 'Vote cast successfully',
        'receipt_hash', receipt_hash
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'message', 'Error casting vote: ' || SQLERRM);
END;
$$;

-- Step 11: Create RLS policies (drop existing first to avoid conflicts)
DO $$
BEGIN
    -- Drop ALL existing policies to avoid conflicts
    DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
    DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
    DROP POLICY IF EXISTS "Public can view elections" ON public.elections;
    DROP POLICY IF EXISTS "Admins can manage elections" ON public.elections;
    DROP POLICY IF EXISTS "Public can view candidates" ON public.candidates;
    DROP POLICY IF EXISTS "Admins can manage candidates" ON public.candidates;
    DROP POLICY IF EXISTS "Users can view their votes" ON public.votes;
    DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_logs;

    -- Disable RLS first
    ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.elections DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.candidates DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.votes DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

    -- Enable RLS
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

    -- Create policies with correct column names
    CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
    CREATE POLICY "Admins can read all users" ON public.users FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

    CREATE POLICY "Public can view elections" ON public.elections FOR SELECT USING (true);
    CREATE POLICY "Admins can manage elections" ON public.elections FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

    CREATE POLICY "Public can view candidates" ON public.candidates FOR SELECT USING (true);
    CREATE POLICY "Admins can manage candidates" ON public.candidates FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

    -- FIXED: Use user_id instead of voter_id
    CREATE POLICY "Users can view their votes" ON public.votes FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Admins can read audit logs" ON public.audit_logs FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
END $$;

-- Step 12: Update any existing data
UPDATE public.users
SET created_at = COALESCE(created_at, NOW())
WHERE created_at IS NULL;

-- Step 13: Success message
SELECT
    'MIGRATION COMPLETED SUCCESSFULLY!' as status,
    'Database schema updated for student-focused system' as message,
    COUNT(*) as total_users
FROM public.users;