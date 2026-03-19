import { supabase } from '@/supabase/client';
import { mapElection, mapCandidate } from './mappers';
import { assertNoError } from './supabase.service';
import type { Election, ElectionWithCandidates, ElectionCreationData, Course, AcademicYear, Section } from '@/types';

/**
 * List all elections, optionally filtered by course/year/section
 */
export async function listElections(filters?: {
  course?: Course;
  year?: AcademicYear;
  section?: Section;
}): Promise<Election[]> {
  let query = supabase
    .from('elections')
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
  assertNoError(error, 'Failed to load elections.');

  return (data ?? []).map(mapElection);
}

/**
 * Get election by ID
 */
export async function getElectionById(id: string): Promise<Election | null> {
  const { data, error } = await supabase
    .from('elections')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  assertNoError(error, 'Failed to load election.');
  return data ? mapElection(data) : null;
}

/**
 * Get election with its candidates
 */
export async function getElectionWithCandidates(id: string): Promise<ElectionWithCandidates | null> {
  const election = await getElectionById(id);
  if (!election) return null;

  // Get candidate IDs from election_candidates junction table
  const { data: junctionData, error: junctionError } = await supabase
    .from('election_candidates')
    .select('candidate_id')
    .eq('election_id', id);

  assertNoError(junctionError, 'Failed to load election candidates.');

  const candidateIds = (junctionData || []).map((j: any) => j.candidate_id);

  if (candidateIds.length === 0) {
    return { ...election, candidates: [] };
  }

  // Get full candidate details
  const { data: candidatesData, error: candidatesError } = await supabase
    .from('candidates')
    .select('*')
    .in('id', candidateIds);

  assertNoError(candidatesError, 'Failed to load candidates.');

  const candidates = (candidatesData ?? []).map(mapCandidate);

  return { ...election, candidates };
}

/**
 * Get active elections for a student (based on current time and eligibility)
 */
export async function getActiveElectionsForStudent(
  course: Course,
  year: AcademicYear,
  section: Section
): Promise<Election[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('elections')
    .select('*')
    .eq('course', course)
    .eq('year', year)
    .eq('section', section)
    .lte('start_time', now)
    .gte('end_time', now)
    .order('start_time', { ascending: true });

  assertNoError(error, 'Failed to load active elections.');

  return (data ?? []).map(mapElection);
}

/**
 * Create a new election with candidates
 */
export async function createElection(data: ElectionCreationData, createdBy: string): Promise<string> {
  // Create election
  const { data: election, error: electionError } = await supabase
    .from('elections')
    .insert({
      title: data.title.trim(),
      description: data.description.trim(),
      course: data.course,
      year: data.year,
      section: data.section,
      start_date: data.startTime,
      end_date: data.endTime,
      status: 'active',
      created_by: createdBy,
    } as any)
    .select('id')
    .single();

  assertNoError(electionError, 'Failed to create election.');
  if (!election) {
    throw new Error('Failed to create election.');
  }

  // Link candidates to election
  if (data.candidateIds.length > 0) {
    const junctionRecords = data.candidateIds.map(candidateId => ({
      election_id: election.id,
      candidate_id: candidateId,
    }));

    const { error: junctionError } = await supabase
      .from('election_candidates')
      .insert(junctionRecords as any);

    // Don't fail if junction table doesn't exist yet
    if (junctionError) {
      console.warn('Could not link candidates to election:', junctionError);
    }
  }

  // Log the action
  await supabase.from('audit_logs').insert({
    action: 'election_created',
    performed_by: createdBy,
    target_id: election.id,
    metadata: {
      course: data.course,
      year: data.year,
      section: data.section,
      candidateCount: data.candidateIds.length,
    },
  });

  return election.id;
}

/**
 * Delete an election
 */
export async function deleteElection(id: string): Promise<void> {
  const { error } = await supabase.from('elections').delete().eq('id', id);
  assertNoError(error, 'Failed to delete election.');
}

/**
 * Get vote count for an election
 */
export async function getElectionVoteCount(electionId: string): Promise<number> {
  const { count, error } = await supabase
    .from('votes')
    .select('id', { count: 'exact', head: true })
    .eq('election_id', electionId);

  assertNoError(error, 'Failed to get vote count.');
  return count ?? 0;
}
