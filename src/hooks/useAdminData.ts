import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase';
import type { AuditLog } from '@/types';

export function useAdminData() {
  const [stats, setStats] = useState({
    totalElections: 0,
    totalCandidates: 0,
    totalVoters: 0,
    totalVotesCast: 0
  });
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const unsubElections = onSnapshot(collection(db, 'elections'), (snap) => {
      let votesCount = 0;
      snap.forEach(d => votesCount += (d.data().totalVotes || 0));
      
      setStats(prev => ({ 
        ...prev, 
        totalElections: snap.size,
        totalVotesCast: votesCount 
      }));
    });

    const unsubCandidates = onSnapshot(collection(db, 'candidates'), (snap) => {
      setStats(prev => ({ ...prev, totalCandidates: snap.size }));
    });

    const unsubUsers = onSnapshot(query(collection(db, 'users')), (snap) => {
      const voters = snap.docs.filter(d => d.data().role === 'voter');
      setStats(prev => ({ ...prev, totalVoters: voters.length }));
    });
    
    const unsubLogs = onSnapshot(
      query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(10)),
      (snap) => {
        setRecentLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog)));
        setLoading(false);
      }
    );

    return () => {
      unsubElections();
      unsubCandidates();
      unsubUsers();
      unsubLogs();
    };
  }, []);

  return { stats, recentLogs, loading };
}
