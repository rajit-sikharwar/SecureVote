import { supabase } from '@/supabase/client';
import { mapAuditLog, mapUser } from './mappers';
import { assertNoError } from './supabase.service';
import type { AppUser, AuditLog } from '@/types';

export async function listUsers(limit = 100): Promise<AppUser[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  assertNoError(error, 'Failed to load users.');
  return (data ?? []).map(mapUser);
}

export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  assertNoError(error, 'Failed to delete user.');
}

export async function listAuditLogs(limit = 10): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);

  assertNoError(error, 'Failed to load recent activity.');
  return (data ?? []).map(mapAuditLog);
}
