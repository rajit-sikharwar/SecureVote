import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { listElections } from '@/services/election.service';
import type { Election } from '@/types';

export function useElections() {
  const { user } = useAuthStore();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setElections([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await listElections(user.role === 'admin' ? undefined : user.category);
      setElections(data);
    } catch (error) {
      console.error('Failed to load elections:', error);
      setElections([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { elections, loading, refresh };
}
