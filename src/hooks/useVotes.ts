import { useCallback, useEffect, useState } from 'react';
import { getUserVotes } from '@/services/vote.service';
import type { Vote } from '@/types';

export function useVotes(voterId?: string) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(Boolean(voterId));

  const refresh = useCallback(async () => {
    if (!voterId) {
      setVotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await getUserVotes(voterId);
      setVotes(data);
    } catch (error) {
      console.error('Error fetching votes:', error);
      setVotes([]);
    } finally {
      setLoading(false);
    }
  }, [voterId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { votes, loading, refresh };
}
