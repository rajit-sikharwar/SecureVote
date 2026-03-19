-- ==============================================
-- SecureVote: Sample Data for Testing
-- ==============================================
-- Run this AFTER the complete_setup.sql script
-- This adds test elections, candidates, and students for testing

-- Add sample students
DO $$
DECLARE
    student1_id uuid := gen_random_uuid();
    student2_id uuid := gen_random_uuid();
    student3_id uuid := gen_random_uuid();
BEGIN
    INSERT INTO public.users (
        id, email, full_name, role, phone, address, college_name,
        enrollment_number, course, year, section, is_active, created_at
    ) VALUES
    (student1_id, 'john.doe@college.edu', 'John Doe', 'student', '+1234567801',
     'Hostel A-101', 'SecureVote College', 'EN2023001', 'BCA', 2, 'A', true, now()),
    (student2_id, 'jane.smith@college.edu', 'Jane Smith', 'student', '+1234567802',
     'Hostel B-202', 'SecureVote College', 'EN2023002', 'BCA', 2, 'A', true, now()),
    (student3_id, 'mike.wilson@college.edu', 'Mike Wilson', 'student', '+1234567803',
     'Hostel C-303', 'SecureVote College', 'EN2023003', 'BCA', 2, 'A', true, now());

    RAISE NOTICE 'Sample students created successfully';
END $$;

-- Add sample candidates
DO $$
DECLARE
    candidate1_id uuid := gen_random_uuid();
    candidate2_id uuid := gen_random_uuid();
    admin_id uuid;
BEGIN
    -- Get admin ID
    SELECT id INTO admin_id FROM public.users WHERE role = 'admin' LIMIT 1;

    INSERT INTO public.candidates (
        id, full_name, bio, department, course, year, section, manifesto, added_by
    ) VALUES
    (candidate1_id, 'Alex Johnson', 'Experienced student leader with focus on academic excellence',
     'Computer Science', 'BCA', 2, 'A', 'I will work to improve lab facilities and study resources', admin_id),
    (candidate2_id, 'Sarah Brown', 'Active in student activities and community service',
     'Computer Science', 'BCA', 2, 'A', 'My priority is better student-faculty communication', admin_id);

    RAISE NOTICE 'Sample candidates created successfully';
END $$;

-- Create sample election
DO $$
DECLARE
    election_id uuid := gen_random_uuid();
    candidate1_id uuid;
    candidate2_id uuid;
    admin_id uuid;
BEGIN
    -- Get IDs
    SELECT id INTO admin_id FROM public.users WHERE role = 'admin' LIMIT 1;
    SELECT id INTO candidate1_id FROM public.candidates WHERE full_name = 'Alex Johnson';
    SELECT id INTO candidate2_id FROM public.candidates WHERE full_name = 'Sarah Brown';

    -- Create election
    INSERT INTO public.elections (
        id, title, description, course, year, section,
        start_date, end_date, status, created_by
    ) VALUES (
        election_id,
        'Class Representative Election 2024',
        'Election for BCA Year 2 Section A class representative position',
        'BCA', 2, 'A',
        now() - interval '1 hour',  -- Started 1 hour ago
        now() + interval '7 days',  -- Ends in 7 days
        'active',
        admin_id
    );

    RAISE NOTICE 'Sample election created successfully';
    RAISE NOTICE 'Election ID: %', election_id;
END $$;

-- Show sample data summary
SELECT
    'SAMPLE DATA CREATED!' as status,
    (SELECT COUNT(*) FROM public.users WHERE role = 'student') as students_added,
    (SELECT COUNT(*) FROM public.candidates) as candidates_added,
    (SELECT COUNT(*) FROM public.elections) as elections_added;

-- Show login details for testing
SELECT
    'ADMIN LOGIN:' as type,
    email,
    'Use any password' as password,
    'localhost:5174/admin/login' as url
FROM public.users WHERE role = 'admin'
UNION ALL
SELECT
    'STUDENT LOGIN:' as type,
    email,
    'Use any password' as password,
    'localhost:5174' as url
FROM public.users WHERE role = 'student' LIMIT 3;