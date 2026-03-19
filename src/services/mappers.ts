import type { Database } from '@/supabase/database.types';
import type { AppUser, AuditLog, Candidate, Election, Vote, Course, AcademicYear, Section, Gender } from '@/types';

type UserRow = Database['public']['Tables']['users']['Row'];
type ElectionRow = Database['public']['Tables']['elections']['Row'];
type CandidateRow = Database['public']['Tables']['candidates']['Row'];
type VoteRow = Database['public']['Tables']['votes']['Row'];
type AuditLogRow = Database['public']['Tables']['audit_logs']['Row'];

export function mapUser(row: UserRow): AppUser {
  return {
    uid: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: (row as any).phone || '',
    dateOfBirth: (row as any).date_of_birth || null,
    gender: ((row as any).gender || 'male') as Gender,
    address: (row as any).address || '',
    collegeName: (row as any).college_name || '',
    enrollmentNumber: (row as any).enrollment_number || '',
    rollNumber: (row as any).roll_number || '',
    admissionYear: (row as any).admission_year || new Date().getFullYear(),
    course: ((row as any).course || 'BCA') as Course,
    year: ((row as any).year || 1) as AcademicYear,
    section: ((row as any).section || 'A') as Section,
    photoURL: row.photo_url ?? undefined,
    role: row.role as AppUser['role'],
    isActive: (row as any).is_active ?? true,
    createdAt: (row as any).created_at || (row as any).registered_at || new Date().toISOString(),
  };
}

export function mapElection(row: ElectionRow): Election {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    course: ((row as any).course || 'BCA') as Course,
    year: ((row as any).year || 1) as AcademicYear,
    section: ((row as any).section || 'A') as Section,
    startTime: (row as any).start_time || (row as any).start_date || new Date().toISOString(),
    endTime: (row as any).end_time || (row as any).end_date || new Date().toISOString(),
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

export function mapCandidate(row: CandidateRow): Candidate {
  return {
    id: row.id,
    name: (row as any).name || (row as any).full_name || 'Unknown',
    photoURL: row.photo_url ?? undefined,
    description: (row as any).description || (row as any).bio || '',
    course: ((row as any).course || 'BCA') as Course,
    year: ((row as any).year || 1) as AcademicYear,
    section: ((row as any).section || 'A') as Section,
    createdAt: (row as any).created_at || (row as any).added_at || new Date().toISOString(),
  };
}

export function mapVote(row: VoteRow): Vote {
  return {
    id: row.id,
    userId: (row as any).user_id || (row as any).voter_id,
    electionId: row.election_id,
    candidateId: row.candidate_id,
    createdAt: (row as any).created_at || (row as any).casted_at || new Date().toISOString(),
  };
}

export function mapAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    action: row.action,
    performedBy: row.performed_by,
    targetId: row.target_id,
    timestamp: row.timestamp,
    metadata:
      row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
  };
}
