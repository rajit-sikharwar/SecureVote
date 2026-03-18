export function getAppError(code: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password.',
    'Email not confirmed': 'Please confirm your email before signing in.',
    'already-exists': 'You have already voted in this election.',
    'duplicate key value violates unique constraint "votes_pkey"':
      'You have already voted in this election.',
    'permission-denied': 'You do not have permission for this action.',
    'JWT expired': 'Your session expired. Please sign in again.',
    'Failed to fetch': 'Unable to reach Supabase. Please check your connection.',
  };
  return map[code] ?? `Something went wrong (${code}). Please try again.`;
}
