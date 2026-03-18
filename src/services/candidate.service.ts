import { supabase } from '@/supabase/client';
import { mapCandidate } from './mappers';
import { assertNoError } from './supabase.service';
import type { Candidate, UserCategory } from '@/types';

export async function listCandidates(
  electionId: string,
  category?: UserCategory
): Promise<Candidate[]> {
  let query = supabase
    .from('candidates')
    .select('*')
    .eq('election_id', electionId)
    .order('added_at', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  assertNoError(error, 'Failed to load candidates.');

  return (data ?? []).map(mapCandidate);
}

export async function countCandidatesByElection(electionId: string): Promise<number> {
  const { count, error } = await supabase
    .from('candidates')
    .select('id', { count: 'exact', head: true })
    .eq('election_id', electionId);

  assertNoError(error, 'Failed to count candidates.');
  return count ?? 0;
}

export async function addCandidate(data: {
  electionId: string;
  category: UserCategory;
  fullName: string;
  department: string;
  bio: string;
  manifesto?: string;
  addedBy: string;
  photoURL?: string;
}): Promise<string> {
  const { data: candidate, error } = await supabase
    .from('candidates')
    .insert({
      election_id: data.electionId,
      category: data.category,
      full_name: data.fullName.trim(),
      department: data.department.trim(),
      bio: data.bio.trim(),
      manifesto: data.manifesto?.trim() || null,
      added_by: data.addedBy,
      photo_url: data.photoURL || null,
      vote_count: 0,
    })
    .select('id')
    .single();

  assertNoError(error, 'Failed to add candidate.');
  if (!candidate) {
    throw new Error('Failed to add candidate.');
  }

  const { error: auditError } = await supabase.from('audit_logs').insert({
    action: 'candidate_added',
    performed_by: data.addedBy,
    target_id: candidate.id,
    metadata: { electionId: data.electionId, category: data.category },
  });

  assertNoError(auditError, 'Candidate added but audit logging failed.');

  return candidate.id;
}

export async function deleteCandidate(id: string): Promise<void> {
  const { error } = await supabase.from('candidates').delete().eq('id', id);
  assertNoError(error, 'Failed to delete candidate.');
}
