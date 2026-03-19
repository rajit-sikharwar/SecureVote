import { useCallback, useEffect, useState } from 'react';
import { getCandidatesForElection } from '@/services/candidate.service';
import type { Candidate } from '@/types';

export function useCandidates(electionId: string) {
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
      const data = await getCandidatesForElection(electionId);
      setCandidates(data);
    } catch (error) {
      console.error('Failed to load candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { candidates, loading, refresh };
}