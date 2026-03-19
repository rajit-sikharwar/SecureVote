-- Setup script for SecureVote Admin Access
-- Run this in Supabase SQL Editor after running migration_to_student_system.sql

-- 1. Create default admin user (update the email to your email)
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  phone,
  address,
  college_name,
  is_active,
  created_at
) VALUES (
  gen_random_uuid(),
  'rjtds47@gmail.com', -- UPDATE THIS TO YOUR EMAIL
  'System Administrator',
  'admin',
  '+1234567890',
  'Admin Office',
  'SecureVote College',
  true,
  now()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  full_name = 'System Administrator';

-- 2. Create additional admin users (add your actual emails here)
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  phone,
  address,
  college_name,
  is_active,
  created_at
) VALUES (
  gen_random_uuid(),
  'sikha@college.edu', -- UPDATE THIS TO YOUR EMAIL
  'Sikha - Admin',
  'admin',
  '+1234567890',
  'College Campus',
  'SecureVote College',
  true,
  now()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  full_name = 'Sikha - Admin';

-- 3. Create a super admin role for managing other admins
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;

-- Make the first admin a super admin
UPDATE public.users
SET is_super_admin = true
WHERE email = 'admin@securevote.com';

-- 4. Create admin management functions
CREATE OR REPLACE FUNCTION public.promote_to_admin(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user public.users;
  current_user_role text;
BEGIN
  -- Get current user role
  SELECT role INTO current_user_role
  FROM public.users
  WHERE id = auth.uid();

  -- Check if current user is admin
  IF current_user_role != 'admin' THEN
    RETURN json_build_object('success', false, 'message', 'Unauthorized: Admin access required');
  END IF;

  -- Update target user to admin
  UPDATE public.users
  SET role = 'admin'
  WHERE email = user_email
  RETURNING * INTO target_user;

  IF target_user IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'User promoted to admin successfully',
    'user', row_to_json(target_user)
  );
END;
$$;

-- 5. Create function to add new admin directly
CREATE OR REPLACE FUNCTION public.add_admin_user(
  admin_email text,
  admin_name text,
  admin_phone text DEFAULT '+1234567890',
  college_name text DEFAULT 'SecureVote College'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_admin public.users;
  current_user_role text;
BEGIN
  -- Get current user role
  SELECT role INTO current_user_role
  FROM public.users
  WHERE id = auth.uid();

  -- Check if current user is admin
  IF current_user_role != 'admin' THEN
    RETURN json_build_object('success', false, 'message', 'Unauthorized: Admin access required');
  END IF;

  -- Insert new admin
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    phone,
    address,
    college_name,
    is_active,
    created_at
  ) VALUES (
    gen_random_uuid(),
    admin_email,
    admin_name,
    'admin',
    admin_phone,
    'Admin Office',
    college_name,
    true,
    now()
  ) RETURNING * INTO new_admin;

  RETURN json_build_object(
    'success', true,
    'message', 'Admin user created successfully',
    'user', row_to_json(new_admin)
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object('success', false, 'message', 'Email already exists');
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', 'Error creating admin user');
END;
$$;

-- 6. Print default admin credentials for reference
SELECT
  'DEFAULT ADMIN CREDENTIALS' as info,
  email,
  'Use this email with any password in Supabase Auth' as password_note
FROM public.users
WHERE role = 'admin'
ORDER BY created_at;