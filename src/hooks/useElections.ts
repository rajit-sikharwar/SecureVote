import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { listElections, getActiveElectionsForStudent } from '@/services/election.service';
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
      let data: Election[];

      if (user.role === 'admin') {
        // Admins see all elections
        data = await listElections();
      } else {
        // Students see only their eligible elections (all, not just active)
        data = await listElections({
          course: user.course,
          year: user.year,
          section: user.section,
        });
      }

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

/**
 * Hook to get only active elections for the current student
 */
export function useActiveElections() {
  const { user } = useAuthStore();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user || user.role !== 'student') {
      setElections([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await getActiveElectionsForStudent(
        user.course,
        user.year,
        user.section
      );

      setElections(data);
    } catch (error) {
      console.error('Failed to load active elections:', error);
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
