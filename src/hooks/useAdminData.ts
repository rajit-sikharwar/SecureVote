import { useCallback, useEffect, useState } from 'react';
import { listAuditLogs, listUsers } from '@/services/user.service';
import { listCandidates } from '@/services/candidate.service';
import { listElections } from '@/services/election.service';
import type { AuditLog, Candidate, Election } from '@/types';

interface AdminStats {
  totalElections: number;
  totalCandidates: number;
  totalVoters: number;
  totalVotesCast: number;
}

const initialStats: AdminStats = {
  totalElections: 0,
  totalCandidates: 0,
  totalVoters: 0,
  totalVotesCast: 0,
};

export function useAdminData() {
  const [stats, setStats] = useState<AdminStats>(initialStats);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const [elections, users, logs] = await Promise.all([
        listElections(),
        listUsers(250),
        listAuditLogs(10),
      ]);

      const candidateGroups = await Promise.all(
        elections.map((election: Election) => listCandidates({ electionId: election.id }))
      );

      const allCandidates = candidateGroups.flatMap((group: Candidate[]) => group);

      setStats({
        totalElections: elections.length,
        totalCandidates: allCandidates.length,
        totalVoters: users.filter((user) => user.role === 'student').length,
        totalVotesCast: elections.reduce((sum, election) => sum + (election.totalVotes || 0), 0),
      });
      setRecentLogs(logs);
    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
      setStats(initialStats);
      setRecentLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { stats, recentLogs, loading, refresh };
}
