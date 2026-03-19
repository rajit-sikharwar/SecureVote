import type { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/supabase/client';
import { mapUser } from './mappers';
import { assertNoError } from './supabase.service';
import type { AppUser, RegistrationData } from '@/types';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

/**
 * Register a new student with complete academic information
 */
export async function registerStudent(
  data: RegistrationData,
  password: string
): Promise<void> {
  const normalizedEmail = normalizeEmail(data.email);

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
  });

  if (authError) {
    throw new Error(authError.message || 'Failed to create account.');
  }

  if (!authData.user) {
    throw new Error('Failed to create account.');
  }

  // Create user profile with complete academic information
  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id,
    email: normalizedEmail,
    full_name: data.fullName.trim(),
    phone: data.phone.trim(),
    date_of_birth: data.dateOfBirth,
    gender: data.gender,
    address: data.address.trim(),
    college_name: data.collegeName.trim(),
    enrollment_number: data.enrollmentNumber.trim(),
    roll_number: data.rollNumber.trim(),
    admission_year: data.admissionYear,
    course: data.course,
    year: data.year,
    section: data.section,
    role: 'student',
    is_active: true,
  });

  if (profileError) {
    // If profile creation fails, try to clean up auth user (best effort)
    await supabase.auth.admin.deleteUser(authData.user.id).catch(() => {});

    if (profileError.code === '23505') {
      if (profileError.message.includes('enrollment_number')) {
        throw new Error('This enrollment number is already registered.');
      }
      if (profileError.message.includes('email')) {
        throw new Error('This email is already registered.');
      }
    }

    assertNoError(profileError, 'Failed to create student profile.');
  }

  // Log the action
  await supabase.from('audit_logs').insert({
    action: 'user_registered',
    performed_by: authData.user.id,
    target_id: authData.user.id,
    metadata: {
      course: data.course,
      year: data.year,
      section: data.section,
      enrollmentNumber: data.enrollmentNumber,
    },
  });
}

/**
 * Sign in student with email and password
 */
export async function signInStudent(email: string, password: string): Promise<AppUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });

  if (error) {
    throw new Error(error.message || 'Unable to sign in.');
  }

  const appUser = await getUserProfile(data.user.id);

  if (!appUser || appUser.role !== 'student') {
    await signOut();
    throw new Error('Invalid student account.');
  }

  return appUser;
}

/**
 * Sign in admin with email and password
 */
export async function signInAdmin(email: string, password: string): Promise<AppUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });

  if (error) {
    throw new Error(error.message || 'Unable to sign in.');
  }

  const appUser = await getUserProfile(data.user.id);

  if (!appUser || appUser.role !== 'admin') {
    await signOut();
    throw new Error('Your account is not authorized as an admin.');
  }

  return appUser;
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', uid)
    .maybeSingle();

  assertNoError(error, 'Failed to load user profile.');
  return data ? mapUser(data) : null;
}

/**
 * Resolve authenticated user
 */
export async function resolveAuthenticatedUser(
  authUser: SupabaseUser | null
): Promise<AppUser | null> {
  if (!authUser) return null;
  return await getUserProfile(authUser.id);
}

/**
 * Update user profile photo
 */
export async function updateCurrentUserPhoto(uid: string, photoURL: string): Promise<AppUser> {
  const { data, error } = await supabase
    .from('users')
    .update({ photo_url: photoURL })
    .eq('id', uid)
    .select('*')
    .single();

  assertNoError(error, 'Failed to update profile photo.');
  if (!data) {
    throw new Error('Failed to update profile photo.');
  }

  await supabase.from('audit_logs').insert({
    action: 'profile_updated',
    performed_by: uid,
    target_id: uid,
    metadata: {},
  });

  return mapUser(data);
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message || 'Unable to sign out.');
  }
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message || 'Unable to restore your session.');
  }

  return data.session;
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(
  cb: (user: SupabaseUser | null, event: AuthChangeEvent) => void
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    cb(session?.user ?? null, event);
  });

  return () => {
    subscription.unsubscribe();
  };
}
