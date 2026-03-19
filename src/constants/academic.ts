import type { Course, AcademicYear, Section, Gender } from '@/types';

// Course information with duration
export interface CourseInfo {
  id: Course;
  label: string;
  duration: number; // in years
  fullName: string;
}

export const COURSES: CourseInfo[] = [
  { id: 'BCA', label: 'BCA', duration: 3, fullName: 'Bachelor of Computer Applications' },
  { id: 'BBA', label: 'BBA', duration: 3, fullName: 'Bachelor of Business Administration' },
  { id: 'B.Tech', label: 'B.Tech', duration: 4, fullName: 'Bachelor of Technology' },
  { id: 'MBA', label: 'MBA', duration: 2, fullName: 'Master of Business Administration' },
  { id: 'MCA', label: 'MCA', duration: 2, fullName: 'Master of Computer Applications' },
  { id: 'BA', label: 'BA', duration: 3, fullName: 'Bachelor of Arts' },
  { id: 'B.Com', label: 'B.Com', duration: 3, fullName: 'Bachelor of Commerce' },
  { id: 'M.Tech', label: 'M.Tech', duration: 2, fullName: 'Master of Technology' },
];

// Course duration mapping
export const COURSE_DURATION: Record<Course, number> = {
  'BCA': 3,
  'BBA': 3,
  'B.Tech': 4,
  'MBA': 2,
  'MCA': 2,
  'BA': 3,
  'B.Com': 3,
  'M.Tech': 2,
};

// Get allowed years for a course
export function getAllowedYears(course: Course): AcademicYear[] {
  const duration = COURSE_DURATION[course];
  return Array.from({ length: duration }, (_, i) => (i + 1) as AcademicYear);
}

// Academic years
export interface YearInfo {
  value: AcademicYear;
  label: string;
}

export const ACADEMIC_YEARS: YearInfo[] = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
];

// Sections
export interface SectionInfo {
  value: Section;
  label: string;
}

export const SECTIONS: SectionInfo[] = [
  { value: 'A', label: 'Section A' },
  { value: 'B', label: 'Section B' },
  { value: 'C', label: 'Section C' },
  { value: 'D', label: 'Section D' },
  { value: 'E', label: 'Section E' },
  { value: 'F', label: 'Section F' },
  { value: 'G', label: 'Section G' },
  { value: 'H', label: 'Section H' },
  { value: 'I', label: 'Section I' },
  { value: 'J', label: 'Section J' },
];

// Gender options
export interface GenderInfo {
  value: Gender;
  label: string;
}

export const GENDERS: GenderInfo[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

// Helper to get course info by ID
export function getCourseInfo(courseId: Course): CourseInfo | undefined {
  return COURSES.find(c => c.id === courseId);
}

// Generate admission years (last 10 years)
export function getAdmissionYears(): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => currentYear - i);
}

// Format department string from course, year, and section
export function formatDepartment(course: Course, year: AcademicYear, section: Section, useCourseLabel = false): string {
  const courseDisplay = useCourseLabel ? getCourseInfo(course)?.label || course : course;
  return `${courseDisplay} - Year ${year}${section}`;
}

// Calculate percentage safely
export function calculatePercentage(value: number, total: number): number {
  return total > 0 ? (value / total) * 100 : 0;
}
