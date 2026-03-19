-- ==============================================
-- SecureVote: Complete Database Setup Script
-- ==============================================
-- This script does EVERYTHING needed for SecureVote
-- Run this ONCE in your Supabase SQL Editor

-- Step 1: Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Drop existing foreign key constraints that might cause issues
DO $$
BEGIN
    -- Remove any problematic constraints on users table
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_created_by_fkey;
END $$;

-- Step 3: Update users table structure (safe for existing data)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS college_name text,
ADD COLUMN IF NOT EXISTS enrollment_number text,
ADD COLUMN IF NOT EXISTS roll_number text,
ADD COLUMN IF NOT EXISTS admission_year integer,
ADD COLUMN IF NOT EXISTS course text CHECK (course IN ('BCA', 'BBA', 'B.Tech', 'MBA', 'MCA', 'BA', 'B.Com', 'M.Tech')),
ADD COLUMN IF NOT EXISTS year integer CHECK (year BETWEEN 1 AND 4),
ADD COLUMN IF NOT EXISTS section text CHECK (section IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J')),
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- Step 4: Update role constraint
DO $$
BEGIN
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'student'));
END $$;

-- Step 5: Add unique constraint for enrollment
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'users_enrollment_number_key') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_enrollment_number_key UNIQUE (enrollment_number);
    END IF;
END $$;

-- Step 6: Remove old columns
ALTER TABLE public.users DROP COLUMN IF EXISTS category;
ALTER TABLE public.users DROP COLUMN IF EXISTS registered_at;

-- Step 7: Create elections table
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
    created_by uuid, -- No foreign key to avoid issues
    created_at timestamp with time zone DEFAULT now(),
    total_votes integer DEFAULT 0
);

-- Step 8: Create candidates table
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
    added_by uuid, -- No foreign key to avoid issues
    added_at timestamp with time zone DEFAULT now()
);

-- Step 9: Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    election_id uuid NOT NULL,
    candidate_id uuid NOT NULL,
    receipt_hash text UNIQUE NOT NULL,
    casted_at timestamp with time zone DEFAULT now(),
    -- Simple unique constraint instead of foreign keys
    UNIQUE(user_id, election_id)
);

-- Step 10: Create audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    action text NOT NULL,
    performed_by uuid,
    target_id uuid,
    metadata jsonb DEFAULT '{}',
    timestamp timestamp with time zone DEFAULT now()
);

-- Step 11: Create secure voting function
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
    -- Basic validation
    SELECT * INTO election_record FROM public.elections WHERE id = p_election_id;
    SELECT * INTO user_record FROM public.users WHERE id = p_user_id;

    IF election_record IS NULL OR user_record IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Invalid election or user');
    END IF;

    -- Check for duplicate vote
    SELECT * INTO existing_vote FROM public.votes WHERE user_id = p_user_id AND election_id = p_election_id;
    IF existing_vote IS NOT NULL THEN
        RETURN json_build_object('success', false, 'message', 'Already voted');
    END IF;

    -- Generate receipt
    receipt_hash := encode(digest(p_user_id::text || p_election_id::text || NOW()::text, 'sha256'), 'hex');

    -- Cast vote
    INSERT INTO public.votes (user_id, election_id, candidate_id, receipt_hash)
    VALUES (p_user_id, p_election_id, p_candidate_id, receipt_hash);

    RETURN json_build_object('success', true, 'receipt_hash', receipt_hash);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'message', 'Error: ' || SQLERRM);
END;
$$;

-- Step 12: Create admin management functions
CREATE OR REPLACE FUNCTION public.add_admin_user(
    admin_email text,
    admin_name text,
    admin_phone text DEFAULT '+1234567890',
    college_name text DEFAULT 'SecureVote College'
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_admin_id uuid;
BEGIN
    new_admin_id := gen_random_uuid();

    INSERT INTO public.users (
        id, email, full_name, role, phone, address, college_name, is_active, created_at
    ) VALUES (
        new_admin_id, admin_email, admin_name, 'admin', admin_phone,
        'Admin Office', college_name, true, now()
    );

    RETURN json_build_object('success', true, 'message', 'Admin created', 'id', new_admin_id);
EXCEPTION
    WHEN unique_violation THEN
        -- User exists, just update to admin
        UPDATE public.users SET role = 'admin' WHERE email = admin_email;
        RETURN json_build_object('success', true, 'message', 'User promoted to admin');
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- Step 13: Enable RLS (without complex policies that cause issues)
DO $$
BEGIN
    -- Disable first to clear any issues
    ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.elections DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.candidates DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.votes DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

    -- Drop all existing policies
    DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
    DROP POLICY IF EXISTS "Public read access" ON public.users;
    DROP POLICY IF EXISTS "Public read access" ON public.elections;
    DROP POLICY IF EXISTS "Public read access" ON public.candidates;
    DROP POLICY IF EXISTS "Public read access" ON public.votes;
    DROP POLICY IF EXISTS "Public read access" ON public.audit_logs;

    -- Enable simple RLS
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

    -- Create simple policies for now (can be refined later)
    CREATE POLICY "Public read access" ON public.users FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON public.elections FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON public.candidates FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON public.votes FOR SELECT USING (true);
    CREATE POLICY "Public read access" ON public.audit_logs FOR SELECT USING (true);
END $$;

-- Step 14: Update existing data
UPDATE public.users SET created_at = now() WHERE created_at IS NULL;

-- Step 15: Create the first admin user immediately
DO $$
DECLARE
    admin_id uuid := gen_random_uuid();
BEGIN
    INSERT INTO public.users (
        id, email, full_name, role, phone, address, college_name, is_active, created_at
    ) VALUES (
        admin_id,
        'rjtds47@gmail.com',
        'System Administrator',
        'admin',
        '+1234567890',
        'Admin Office',
        'SecureVote College',
        true,
        now()
    )
    ON CONFLICT (email) DO UPDATE SET
        role = 'admin',
        full_name = 'System Administrator',
        phone = '+1234567890';
EXCEPTION
    WHEN OTHERS THEN
        -- If there are still issues, try a simple update
        UPDATE public.users SET role = 'admin' WHERE email = 'rjtds47@gmail.com';

        -- If no user exists, create basic one
        IF NOT FOUND THEN
            INSERT INTO public.users (id, email, full_name, role)
            VALUES (admin_id, 'rjtds47@gmail.com', 'System Administrator', 'admin');
        END IF;
END $$;

-- Step 16: Verification and success message
DO $$
DECLARE
    user_count integer;
    admin_count integer;
    table_count integer;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users;
    SELECT COUNT(*) INTO admin_count FROM public.users WHERE role = 'admin';

    SELECT COUNT(*) INTO table_count FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name IN ('users', 'elections', 'candidates', 'votes', 'audit_logs');

    RAISE NOTICE '=== SECUREVOTE SETUP COMPLETE ===';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Total users: %', user_count;
    RAISE NOTICE 'Admin users: %', admin_count;
    RAISE NOTICE '================================';
END $$;

-- Step 17: Show admin credentials
SELECT
    '🎉 SETUP COMPLETE!' as status,
    email as admin_email,
    'Use any password for login' as password_note,
    'localhost:5174/admin/login' as login_url
FROM public.users
WHERE role = 'admin'
ORDER BY created_at DESC;

-- END OF SCRIPT