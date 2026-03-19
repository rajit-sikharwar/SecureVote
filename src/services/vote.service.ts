import { supabase } from '@/supabase/client';
import { mapVote } from './mappers';
import { assertNoError } from './supabase.service';
import type { Vote, VoteDetails } from '@/types';

/**
 * Cast a vote for a candidate in an election
 */
export async function castVote(
  userId: string,
  electionId: string,
  candidateId: string
): Promise<void> {
  const { error } = await supabase.rpc('cast_vote_secure' as any, {
    p_user_id: userId,
    p_election_id: electionId,
    p_candidate_id: candidateId,
  });

  if (error) {
    // Handle specific error messages from the database function
    if (error.message.includes('not eligible')) {
      throw new Error('You are not eligible to vote in this election.');
    }
    if (error.message.includes('not started')) {
      throw new Error('This election has not started yet.');
    }
    if (error.message.includes('has ended')) {
      throw new Error('This election has ended.');
    }
    if (error.message.includes('already voted')) {
      throw new Error('You have already voted in this election.');
    }

    assertNoError(error, 'Failed to cast vote.');
  }
}

/**
 * Get all votes for a user
 */
export async function getUserVotes(userId: string): Promise<Vote[]> {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  assertNoError(error, 'Failed to load your votes.');
  return (data ?? []).map(mapVote);
}

/**
 * Get detailed vote information with election and candidate names
 */
export async function getUserVotesDetailed(userId: string): Promise<VoteDetails[]> {
  const votes = await getUserVotes(userId);

  if (votes.length === 0) {
    return [];
  }

  const electionIds = [...new Set(votes.map((vote) => vote.electionId))];
  const candidateIds = [...new Set(votes.map((vote) => vote.candidateId))];

  const [{ data: elections, error: electionsError }, { data: candidates, error: candidatesError }] =
    await Promise.all([
      supabase.from('elections').select('id, title').in('id', electionIds),
      supabase.from('candidates').select('id, name').in('id', candidateIds),
    ]);

  assertNoError(electionsError, 'Failed to load related elections.');
  assertNoError(candidatesError, 'Failed to load related candidates.');

  const electionMap = new Map((elections ?? []).map((election) => [election.id, election.title]));
  const candidateMap = new Map(
    (candidates ?? []).map((candidate) => [candidate.id, candidate.name])
  );

  return votes.map((vote) => ({
    ...vote,
    electionTitle: electionMap.get(vote.electionId) ?? 'Unknown Election',
    candidateName: candidateMap.get(vote.candidateId) ?? 'Unknown Candidate',
  }));
}

/**
 * Check if a user has voted in an election
 */
export async function hasVoted(userId: string, electionId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('votes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('election_id', electionId);

  assertNoError(error, 'Failed to check vote status.');
  return (count ?? 0) > 0;
}

/**
 * Get vote counts for all candidates in an election
 */
export async function getElectionResults(electionId: string) {
  // Get all candidates for this election
  const { data: junctionData, error: junctionError } = await supabase
    .from('election_candidates')
    .select('candidate_id')
    .eq('election_id', electionId);

  assertNoError(junctionError, 'Failed to load election candidates.');

  const candidateIds = (junctionData ?? []).map(j => j.candidate_id);

  if (candidateIds.length === 0) {
    return [];
  }

  // Get vote counts
  const { data: voteData, error: voteError } = await supabase
    .from('votes')
    .select('candidate_id')
    .eq('election_id', electionId);

  assertNoError(voteError, 'Failed to load votes.');

  // Count votes per candidate
  const voteCounts = new Map<string, number>();
  (voteData ?? []).forEach(vote => {
    voteCounts.set(vote.candidate_id, (voteCounts.get(vote.candidate_id) || 0) + 1);
  });

  // Get candidate details
  const { data: candidates, error: candidatesError } = await supabase
    .from('candidates')
    .select('id, name, photo_url')
    .in('id', candidateIds);

  assertNoError(candidatesError, 'Failed to load candidates.');

  // Combine data
  return (candidates ?? []).map(candidate => ({
    candidateId: candidate.id,
    candidateName: candidate.name,
    photoURL: candidate.photo_url,
    voteCount: voteCounts.get(candidate.id) || 0,
  }));
}

/**
 * Get total vote count for an election
 */
export async function getTotalVotesForElection(electionId: string): Promise<number> {
  const { count, error } = await supabase
    .from('votes')
    .select('id', { count: 'exact', head: true })
    .eq('election_id', electionId);

  assertNoError(error, 'Failed to count votes.');
  return count ?? 0;
}
