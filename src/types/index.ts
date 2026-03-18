import { Timestamp, FieldValue } from 'firebase/firestore';

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
  registeredAt: Timestamp | FieldValue;
  isActive: boolean;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  status: ElectionStatus;
  eligibleCategories: UserCategory[];
  createdBy: string;
  createdAt: Timestamp | FieldValue;
  startDate: Timestamp;
  endDate: Timestamp;
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
  addedAt: Timestamp | FieldValue;
}

export interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  voterId: string;
  category: UserCategory;
  castedAt: Timestamp | FieldValue;
  receiptHash: string;
}

export interface AuditLog {
  id: string;
  action:
    | 'vote_cast'
    | 'election_created'
    | 'election_closed'
    | 'candidate_added'
    | 'user_registered';
  performedBy: string;
  targetId: string;
  timestamp: Timestamp | FieldValue;
  metadata: Record<string, unknown>;
}
