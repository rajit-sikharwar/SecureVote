import { supabase } from '@/supabase/client';
import { generateReceiptHash } from '@/lib/crypto';
import { mapVote } from './mappers';
import { assertNoError } from './supabase.service';
import type { UserCategory, Vote, VoteDetails } from '@/types';

export async function castVote(
  voterId: string,
  electionId: string,
  candidateId: string,
  category: UserCategory
): Promise<string> {
  const receiptHash = await generateReceiptHash(voterId, electionId, candidateId);

  const { data, error } = await supabase.rpc('cast_vote_secure', {
    p_voter_id: voterId,
    p_election_id: electionId,
    p_candidate_id: candidateId,
    p_category: category,
    p_receipt_hash: receiptHash,
  });

  assertNoError(error, 'Failed to cast vote.');
  return data ?? receiptHash;
}

export async function getUserVotes(voterId: string): Promise<Vote[]> {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('voter_id', voterId)
    .order('casted_at', { ascending: false });

  assertNoError(error, 'Failed to load your votes.');
  return (data ?? []).map(mapVote);
}

export async function getUserVotesDetailed(voterId: string): Promise<VoteDetails[]> {
  const votes = await getUserVotes(voterId);

  const electionIds = [...new Set(votes.map((vote) => vote.electionId))];
  const candidateIds = [...new Set(votes.map((vote) => vote.candidateId))];

  const [{ data: elections, error: electionsError }, { data: candidates, error: candidatesError }] =
    await Promise.all([
      supabase.from('elections').select('id, title').in('id', electionIds),
      supabase.from('candidates').select('id, full_name').in('id', candidateIds),
    ]);

  assertNoError(electionsError, 'Failed to load related elections.');
  assertNoError(candidatesError, 'Failed to load related candidates.');

  const electionMap = new Map((elections ?? []).map((election) => [election.id, election.title]));
  const candidateMap = new Map(
    (candidates ?? []).map((candidate) => [candidate.id, candidate.full_name])
  );

  return votes.map((vote) => ({
    ...vote,
    electionName: electionMap.get(vote.electionId) ?? 'Unknown Election',
    candidateName: candidateMap.get(vote.candidateId) ?? 'Unknown Candidate',
  }));
}

export async function hasVoted(voterId: string, electionId: string): Promise<boolean> {
  const voteId = `${voterId}_${electionId}`;

  const { count, error } = await supabase
    .from('votes')
    .select('id', { count: 'exact', head: true })
    .eq('id', voteId);

  assertNoError(error, 'Failed to check vote status.');
  return (count ?? 0) > 0;
}
