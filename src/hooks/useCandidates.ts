import { useCallback, useEffect, useState } from 'react';
import { listCandidates } from '@/services/candidate.service';
import type { Candidate, UserCategory } from '@/types';

export function useCandidates(electionId: string, category?: UserCategory, isAdmin?: boolean) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(Boolean(electionId));

  const refresh = useCallback(async () => {
    if (!electionId) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await listCandidates(electionId, isAdmin ? undefined : category);
      setCandidates(data);
    } catch (error) {
      console.error('Failed to load candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [category, electionId, isAdmin]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { candidates, loading, refresh };
}
