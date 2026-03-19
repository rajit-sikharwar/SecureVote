// Student-focused SecureVote types

export type Course = 'BCA' | 'BBA' | 'B.Tech' | 'MBA' | 'MCA' | 'BA' | 'B.Com' | 'M.Tech';
export type AcademicYear = 1 | 2 | 3 | 4;
export type Section = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';
export type Gender = 'male' | 'female' | 'other';
export type UserRole = 'student' | 'admin';
export type ElectionStatus = 'active' | 'completed' | 'upcoming';

// User/Student interface with complete academic information
export interface AppUser {
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  collegeName: string;
  enrollmentNumber: string;
  rollNumber: string;
  admissionYear: number;
  course: Course;
  year: AcademicYear;
  section: Section;
  photoURL?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

// Candidate interface
export interface Candidate {
  id: string;
  name: string;
  photoURL?: string;
  description: string;
  course: Course;
  year: AcademicYear;
  section: Section;
  createdAt: string;
}

// Election interface with course/year/section eligibility
export interface Election {
  id: string;
  title: string;
  description: string;
  course: Course;
  year: AcademicYear;
  section: Section;
  startTime: string;
  endTime: string;
  createdAt: string;
  createdBy: string;
}

// Election with candidates
export interface ElectionWithCandidates extends Election {
  candidates: Candidate[];
}

// Vote interface
export interface Vote {
  id: string;
  userId: string;
  electionId: string;
  candidateId: string;
  createdAt: string;
}

// Vote details for display
export interface VoteDetails extends Vote {
  electionTitle: string;
  candidateName: string;
}

// Audit log
export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  targetId: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

// Registration form data
export interface RegistrationData {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;

  // College Information
  collegeName: string;
  enrollmentNumber: string;
  rollNumber: string;
  admissionYear: number;

  // Academic Information
  course: Course;
  year: AcademicYear;
  section: Section;
}

// Election creation data
export interface ElectionCreationData {
  title: string;
  description: string;
  course: Course;
  year: AcademicYear;
  section: Section;
  startTime: string;
  endTime: string;
  candidateIds: string[];
}

// Candidate creation data
export interface CandidateCreationData {
  name: string;
  photoURL?: string;
  description: string;
  course: Course;
  year: AcademicYear;
  section: Section;
}

// Vote count for analytics
export interface VoteCount {
  candidateId: string;
  candidateName: string;
  voteCount: number;
}

// Election results
export interface ElectionResults {
  election: Election;
  results: VoteCount[];
  totalVotes: number;
}
