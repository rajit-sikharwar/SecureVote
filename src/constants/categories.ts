export const CATEGORIES = [
  { id: 'student'    as const, label: 'Student',    emoji: '🎓', color: '#6366F1', bg: '#EEF2FF' },
  { id: 'teacher'    as const, label: 'Teacher',    emoji: '📚', color: '#0EA5E9', bg: '#E0F2FE' },
  { id: 'staff'      as const, label: 'Staff',      emoji: '💼', color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'management' as const, label: 'Management', emoji: '🏛️', color: '#8B5CF6', bg: '#EDE9FE' },
];
export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
