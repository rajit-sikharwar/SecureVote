import { supabase } from '@/supabase/client';
import { mapElection } from './mappers';
import { assertNoError } from './supabase.service';
import type { Election, ElectionStatus, UserCategory } from '@/types';

export async function listElections(category?: UserCategory): Promise<Election[]> {
  let query = supabase
    .from('elections')
    .select('*')
    .order('created_at', { ascending: false });

  if (category) {
    query = query.contains('eligible_categories', [category]);
  }

  const { data, error } = await query;
  assertNoError(error, 'Failed to load elections.');

  return (data ?? []).map(mapElection);
}

export async function createElection(data: {
  title: string;
  description: string;
  eligibleCategories: UserCategory[];
  startDate: Date;
  endDate: Date;
  status: ElectionStatus;
  createdBy: string;
}): Promise<string> {
  const payload = {
    title: data.title.trim(),
    description: data.description.trim(),
    eligible_categories: data.eligibleCategories,
    start_date: data.startDate.toISOString(),
    end_date: data.endDate.toISOString(),
    status: data.status,
    created_by: data.createdBy,
    total_votes: 0,
  };

  const { data: election, error } = await supabase
    .from('elections')
    .insert(payload)
    .select('id')
    .single();

  assertNoError(error, 'Failed to create election.');
  if (!election) {
    throw new Error('Failed to create election.');
  }

  const { error: auditError } = await supabase.from('audit_logs').insert({
    action: 'election_created',
    performed_by: data.createdBy,
    target_id: election.id,
    metadata: { status: data.status, eligibleCategories: data.eligibleCategories },
  });

  assertNoError(auditError, 'Election was created but audit logging failed.');

  return election.id;
}

export async function updateElectionStatus(
  id: string,
  status: ElectionStatus,
  performedBy?: string
): Promise<void> {
  const { error } = await supabase
    .from('elections')
    .update({ status })
    .eq('id', id);

  assertNoError(error, 'Failed to update election status.');

  if (performedBy) {
    const { error: auditError } = await supabase.from('audit_logs').insert({
      action: status === 'closed' ? 'election_closed' : 'election_created',
      performed_by: performedBy,
      target_id: id,
      metadata: { status },
    });

    assertNoError(auditError, 'Status updated but audit logging failed.');
  }
}

export async function deleteElection(id: string): Promise<void> {
  const { error } = await supabase.from('elections').delete().eq('id', id);
  assertNoError(error, 'Failed to delete election.');
}
