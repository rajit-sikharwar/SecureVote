-- ============================================
-- SecureVote - Database Validation Script
-- ============================================
-- Run this after executing users.sql and admin.sql
-- to verify the database is set up correctly
-- ============================================

-- Step 1: Verify all tables exist
DO $$
DECLARE
  v_table_count INTEGER;
  v_expected_tables TEXT[] := ARRAY['users', 'candidates', 'elections', 'election_candidates', 'votes', 'audit_logs'];
  v_table TEXT;
  v_missing_tables TEXT[] := '{}';
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'SecureVote Database Validation';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  
  -- Check each expected table
  RAISE NOTICE '1. Checking Tables...';
  FOREACH v_table IN ARRAY v_expected_tables
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = v_table
    ) THEN
      RAISE NOTICE '   ✓ %', v_table;
    ELSE
      v_missing_tables := array_append(v_missing_tables, v_table);
      RAISE NOTICE '   ✗ % (MISSING)', v_table;
    END IF;
  END LOOP;
  
  IF array_length(v_missing_tables, 1) > 0 THEN
    RAISE EXCEPTION 'Missing tables: %. Please run users.sql and admin.sql', array_to_string(v_missing_tables, ', ');
  END IF;
  
  RAISE NOTICE '';
END $$;

-- Step 2: Verify all functions exist
DO $$
DECLARE
  v_expected_functions TEXT[] := ARRAY[
    'is_admin',
    'cast_vote',
    'get_election_results',
    'get_election_vote_count',
    'get_total_vote_count',
    'create_admin_user',
    'deactivate_user',
    'clear_all_sessions'
  ];
  v_function TEXT;
  v_missing_functions TEXT[] := '{}';
BEGIN
  RAISE NOTICE '2. Checking Functions...';
  FOREACH v_function IN ARRAY v_expected_functions
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' AND routine_name = v_function
    ) THEN
      RAISE NOTICE '   ✓ %', v_function;
    ELSE
      v_missing_functions := array_append(v_missing_functions, v_function);
      RAISE NOTICE '   ✗ % (MISSING)', v_function;
    END IF;
  END LOOP;
  
  IF array_length(v_missing_functions, 1) > 0 THEN
    RAISE EXCEPTION 'Missing functions: %. Please run users.sql and admin.sql', array_to_string(v_missing_functions, ', ');
  END IF;
  
  RAISE NOTICE '';
END $$;

-- Step 3: Verify RLS is enabled
DO $$
DECLARE
  v_table RECORD;
  v_rls_disabled TEXT[] := '{}';
BEGIN
  RAISE NOTICE '3. Checking Row Level Security...';
  FOR v_table IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN ('users', 'candidates', 'elections', 'election_candidates', 'votes', 'audit_logs')
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename = v_table.tablename 
        AND rowsecurity = true
    ) THEN
      RAISE NOTICE '   ✓ % (RLS enabled)', v_table.tablename;
    ELSE
      v_rls_disabled := array_append(v_rls_disabled, v_table.tablename);
      RAISE NOTICE '   ✗ % (RLS DISABLED)', v_table.tablename;
    END IF;
  END LOOP;
  
  IF array_length(v_rls_disabled, 1) > 0 THEN
    RAISE WARNING 'RLS disabled on: %. This is a security risk!', array_to_string(v_rls_disabled, ', ');
  END IF;
  
  RAISE NOTICE '';
END $$;

-- Step 4: Verify indexes exist
DO $$
DECLARE
  v_index_count INTEGER;
BEGIN
  RAISE NOTICE '4. Checking Indexes...';
  
  SELECT COUNT(*) INTO v_index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';
  
  IF v_index_count >= 10 THEN
    RAISE NOTICE '   ✓ Found % performance indexes', v_index_count;
  ELSE
    RAISE WARNING '   ⚠ Only % indexes found (expected at least 10)', v_index_count;
  END IF;
  
  RAISE NOTICE '';
END $$;

-- Step 5: Verify admin user exists
DO $$
DECLARE
  v_admin_count INTEGER;
BEGIN
  RAISE NOTICE '5. Checking Admin Users...';
  
  SELECT COUNT(*) INTO v_admin_count
  FROM public.users
  WHERE role = 'admin' AND is_active = true;
  
  IF v_admin_count > 0 THEN
    RAISE NOTICE '   ✓ Found % active admin user(s)', v_admin_count;
  ELSE
    RAISE WARNING '   ⚠ No admin users found! Run admin.sql or use create_admin_user()';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- Step 6: Test is_admin() function
DO $$
BEGIN
  RAISE NOTICE '6. Testing is_admin() Function...';
  
  IF public.is_admin() IS NOT NULL THEN
    RAISE NOTICE '   ✓ is_admin() function works (returns: %)', public.is_admin();
  ELSE
    RAISE WARNING '   ⚠ is_admin() returned NULL';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- Step 7: Verify foreign key relationships
DO $$
DECLARE
  v_fk_count INTEGER;
BEGIN
  RAISE NOTICE '7. Checking Foreign Key Constraints...';
  
  SELECT COUNT(*) INTO v_fk_count
  FROM information_schema.table_constraints
  WHERE constraint_schema = 'public'
    AND constraint_type = 'FOREIGN KEY';
  
  IF v_fk_count >= 8 THEN
    RAISE NOTICE '   ✓ Found % foreign key constraints', v_fk_count;
  ELSE
    RAISE WARNING '   ⚠ Only % foreign keys found (expected at least 8)', v_fk_count;
  END IF;
  
  RAISE NOTICE '';
END $$;

-- Step 8: Verify unique constraints
DO $$
DECLARE
  v_unique_count INTEGER;
BEGIN
  RAISE NOTICE '8. Checking Unique Constraints...';
  
  SELECT COUNT(*) INTO v_unique_count
  FROM information_schema.table_constraints
  WHERE constraint_schema = 'public'
    AND constraint_type = 'UNIQUE';
  
  IF v_unique_count >= 4 THEN
    RAISE NOTICE '   ✓ Found % unique constraints', v_unique_count;
  ELSE
    RAISE WARNING '   ⚠ Only % unique constraints found', v_unique_count;
  END IF;
  
  RAISE NOTICE '';
END $$;

-- Final Summary
DO $$
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Validation Complete!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Create additional admin users with: SELECT create_admin_user(...)';
  RAISE NOTICE '2. Test voting flow in your application';
  RAISE NOTICE '3. Verify admin dashboard displays results correctly';
  RAISE NOTICE '';
END $$;
