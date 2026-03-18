export type UserCategory = 'student' | 'teacher' | 'staff' | 'management';
export type UserRole = 'voter' | 'admin';
export type ElectionStatus = 'active' | 'closed' | 'draft';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  category?: UserCategory;
  registeredAt: string;
  isActive: boolean;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  status: ElectionStatus;
  eligibleCategories: UserCategory[];
  createdBy: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  totalVotes: number;
}

export interface Candidate {
  id: string;
  electionId: string;
  category: UserCategory;
  fullName: string;
  department: string;
  bio: string;
  manifesto?: string;
  photoURL?: string;
  voteCount: number;
  addedBy: string;
  addedAt: string;
}

export interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  voterId: string;
  category: UserCategory;
  castedAt: string;
  receiptHash: string;
}

export interface AuditLog {
  id: string;
  action:
    | 'vote_cast'
    | 'election_created'
    | 'election_closed'
    | 'candidate_added'
    | 'user_registered'
    | 'profile_updated';
  performedBy: string;
  targetId: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface VoteDetails extends Vote {
  electionName: string;
  candidateName: string;
}
