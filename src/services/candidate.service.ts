import { supabase } from '@/supabase/client';
import { mapCandidate } from './mappers';
import { assertNoError } from './supabase.service';
import type { Candidate, CandidateCreationData, Course, AcademicYear, Section } from '@/types';

/**
 * List all candidate profiles
 */
export async function listAllCandidates(): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false });

  assertNoError(error, 'Failed to load candidates.');
  return (data ?? []).map(mapCandidate);
}

/**
 * List candidates filtered by course/year/section
 */
export async function listCandidates(filters?: {
  course?: Course;
  year?: AcademicYear;
  section?: Section;
}): Promise<Candidate[]> {
  let query = supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.course) {
    query = query.eq('course', filters.course);
  }
  if (filters?.year) {
    query = query.eq('year', filters.year);
  }
  if (filters?.section) {
    query = query.eq('section', filters.section);
  }

  const { data, error } = await query;
  assertNoError(error, 'Failed to load candidates.');

  return (data ?? []).map(mapCandidate);
}

/**
 * Get candidate by ID
 */
export async function getCandidateById(id: string): Promise<Candidate | null> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  assertNoError(error, 'Failed to load candidate.');
  return data ? mapCandidate(data) : null;
}

/**
 * Get candidates for a specific election
 */
export async function getCandidatesForElection(electionId: string): Promise<Candidate[]> {
  // Get candidate IDs from junction table
  const { data: junctionData, error: junctionError } = await supabase
    .from('election_candidates')
    .select('candidate_id')
    .eq('election_id', electionId);

  assertNoError(junctionError, 'Failed to load election candidates.');

  const candidateIds = (junctionData || []).map((j: any) => j.candidate_id);

  if (candidateIds.length === 0) {
    return [];
  }

  // Get full candidate details
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .in('id', candidateIds)
    .order('created_at', { ascending: true });

  assertNoError(error, 'Failed to load candidates.');
  return (data ?? []).map(mapCandidate);
}

/**
 * Create a new candidate profile
 */
export async function createCandidate(data: CandidateCreationData): Promise<string> {
  const { data: candidate, error } = await supabase
    .from('candidates')
    .insert({
      full_name: data.name.trim(),
      photo_url: data.photoURL || null,
      bio: data.description.trim(),
      course: data.course,
      year: data.year,
      section: data.section,
    } as any)
    .select('id')
    .single();

  assertNoError(error, 'Failed to create candidate.');
  if (!candidate) {
    throw new Error('Failed to create candidate.');
  }

  return candidate.id;
}

/**
 * Update candidate profile
 */
export async function updateCandidate(
  id: string,
  data: Partial<CandidateCreationData>
): Promise<void> {
  const updates: any = {};

  if (data.name !== undefined) updates.name = data.name.trim();
  if (data.photoURL !== undefined) updates.photo_url = data.photoURL || null;
  if (data.description !== undefined) updates.description = data.description.trim();
  if (data.course !== undefined) updates.course = data.course;
  if (data.year !== undefined) updates.year = data.year;
  if (data.section !== undefined) updates.section = data.section;

  const { error } = await supabase
    .from('candidates')
    .update(updates)
    .eq('id', id);

  assertNoError(error, 'Failed to update candidate.');
}

/**
 * Delete a candidate profile
 */
export async function deleteCandidate(id: string): Promise<void> {
  const { error } = await supabase.from('candidates').delete().eq('id', id);
  assertNoError(error, 'Failed to delete candidate.');
}

/**
 * Count candidates by course/year/section
 */
export async function countCandidates(filters?: {
  course?: Course;
  year?: AcademicYear;
  section?: Section;
}): Promise<number> {
  let query = supabase
    .from('candidates')
    .select('id', { count: 'exact', head: true });

  if (filters?.course) {
    query = query.eq('course', filters.course);
  }
  if (filters?.year) {
    query = query.eq('year', filters.year);
  }
  if (filters?.section) {
    query = query.eq('section', filters.section);
  }

  const { count, error } = await query;
  assertNoError(error, 'Failed to count candidates.');
  return count ?? 0;
}
