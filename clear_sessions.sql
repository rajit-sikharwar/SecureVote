-- ==============================================
-- Clear Browser Session Storage
-- ==============================================
-- Run this SQL to clear any existing admin sessions in Supabase

-- Clear all active sessions (forces re-login)
DELETE FROM auth.sessions;

-- Clear any refresh tokens
DELETE FROM auth.refresh_tokens;

-- Optional: Clear any stored user sessions
UPDATE auth.users SET last_sign_in_at = NULL WHERE email = 'rjtds47@gmail.com';

SELECT 'All sessions cleared - Users must login again' as status;

-- Check remaining sessions
SELECT
  COUNT(*) as active_sessions,
  'Sessions should be 0 for clean slate' as note
FROM auth.sessions;