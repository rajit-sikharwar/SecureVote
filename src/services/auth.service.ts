import type { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/supabase/client';
import { mapUser } from './mappers';
import { assertNoError } from './supabase.service';
import type { AppUser, UserCategory } from '@/types';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

async function getRegistrationByEmail(email: string) {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('email', normalizeEmail(email))
    .maybeSingle();

  assertNoError(error, 'Failed to load voter registration.');
  return data;
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    throw new Error(error.message || 'Unable to start Google sign-in.');
  }
}

export async function preRegisterVoter(
  name: string,
  email: string,
  category: UserCategory
): Promise<void> {
  const normalizedEmail = normalizeEmail(email);

  const { error } = await supabase.from('registrations').upsert(
    {
      email: normalizedEmail,
      name: name.trim(),
      category,
    },
    {
      onConflict: 'email',
    }
  );

  assertNoError(error, 'Failed to register voter.');
}

export async function signInAdmin(email: string, password: string): Promise<AppUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });

  if (error) {
    throw new Error(error.message || 'Unable to sign in.');
  }

  const appUser = await resolveAuthenticatedUser(data.user);

  if (!appUser || appUser.role !== 'admin') {
    await signOut();
    throw new Error('Your account is not authorized as an admin.');
  }

  return appUser;
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', uid)
    .maybeSingle();

  assertNoError(error, 'Failed to load user profile.');
  return data ? mapUser(data) : null;
}

export async function resolveAuthenticatedUser(
  authUser: SupabaseUser | null
): Promise<AppUser | null> {
  if (!authUser) return null;

  const existingUser = await getUserProfile(authUser.id);
  if (existingUser) return existingUser;

  const email = authUser.email ? normalizeEmail(authUser.email) : '';
  if (!email) return null;

  const registration = await getRegistrationByEmail(email);
  if (!registration) return null;

  const insertPayload = {
    id: authUser.id,
    full_name: registration.name,
    email,
    role: 'voter',
    category: registration.category,
    photo_url: authUser.user_metadata.avatar_url ?? null,
    is_active: true,
  };

  const { data: insertedUser, error: insertError } = await supabase
    .from('users')
    .insert(insertPayload)
    .select('*')
    .single();

  assertNoError(insertError, 'Failed to create voter profile.');
  if (!insertedUser) {
    throw new Error('Failed to create voter profile.');
  }

  const { error: deleteError } = await supabase
    .from('registrations')
    .delete()
    .eq('id', registration.id);

  assertNoError(deleteError, 'Failed to finalize voter registration.');

  const { error: auditError } = await supabase.from('audit_logs').insert({
    action: 'user_registered',
    performed_by: authUser.id,
    target_id: authUser.id,
    metadata: { category: registration.category },
  });

  assertNoError(auditError, 'Failed to record registration audit log.');

  return mapUser(insertedUser);
}

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

  const { error: auditError } = await supabase.from('audit_logs').insert({
    action: 'profile_updated',
    performed_by: uid,
    target_id: uid,
    metadata: {},
  });

  assertNoError(auditError, 'Failed to record profile update.');

  return mapUser(data);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message || 'Unable to sign out.');
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message || 'Unable to restore your session.');
  }

  return data.session;
}

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
