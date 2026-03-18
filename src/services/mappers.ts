import type { Database } from '@/supabase/database.types';
import type { AppUser, AuditLog, Candidate, Election, Vote } from '@/types';

type UserRow = Database['public']['Tables']['users']['Row'];
type ElectionRow = Database['public']['Tables']['elections']['Row'];
type CandidateRow = Database['public']['Tables']['candidates']['Row'];
type VoteRow = Database['public']['Tables']['votes']['Row'];
type AuditLogRow = Database['public']['Tables']['audit_logs']['Row'];

export function mapUser(row: UserRow): AppUser {
  return {
    uid: row.id,
    name: row.full_name,
    email: row.email,
    photoURL: row.photo_url ?? undefined,
    role: row.role as AppUser['role'],
    category: (row.category as AppUser['category']) ?? undefined,
    registeredAt: row.registered_at,
    isActive: row.is_active,
  };
}

export function mapElection(row: ElectionRow): Election {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as Election['status'],
    eligibleCategories: row.eligible_categories as Election['eligibleCategories'],
    createdBy: row.created_by,
    createdAt: row.created_at,
    startDate: row.start_date,
    endDate: row.end_date,
    totalVotes: row.total_votes,
  };
}

export function mapCandidate(row: CandidateRow): Candidate {
  return {
    id: row.id,
    electionId: row.election_id,
    category: row.category as Candidate['category'],
    fullName: row.full_name,
    department: row.department,
    bio: row.bio,
    manifesto: row.manifesto ?? undefined,
    photoURL: row.photo_url ?? undefined,
    voteCount: row.vote_count,
    addedBy: row.added_by,
    addedAt: row.added_at,
  };
}

export function mapVote(row: VoteRow): Vote {
  return {
    id: row.id,
    electionId: row.election_id,
    candidateId: row.candidate_id,
    voterId: row.voter_id,
    category: row.category as Vote['category'],
    castedAt: row.casted_at,
    receiptHash: row.receipt_hash,
  };
}

export function mapAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    action: row.action as AuditLog['action'],
    performedBy: row.performed_by,
    targetId: row.target_id,
    timestamp: row.timestamp,
    metadata:
      row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
  };
}
