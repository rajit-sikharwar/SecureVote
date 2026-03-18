import type { PostgrestError } from '@supabase/supabase-js';

export function assertNoError(error: PostgrestError | null, fallback: string): void {
  if (error) {
    throw new Error(error.message || fallback);
  }
}
