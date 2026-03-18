import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useElections } from '@/hooks/useElections';
import { hasVoted } from '@/services/vote.service';
import { ROUTES } from '@/constants/routes';
import { ElectionCard } from '@/components/shared/ElectionCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

export default function UserHome() {
  const { user } = useAuthStore();
  const { elections, loading } = useElections();
  const navigate = useNavigate();
  
  const [voteStatuses, setVoteStatuses] = useState<Record<string, boolean>>({});
  const [showClosed, setShowClosed] = useState(false);

  useEffect(() => {
    if (!user || !elections.length) return;
    
    // Check vote status for each election
    const checkVotes = async () => {
      const statuses: Record<string, boolean> = {};
      await Promise.all(
        elections.map(async (e) => {
          statuses[e.id] = await hasVoted(user.uid, e.id);
        })
      );
      setVoteStatuses(statuses);
    };
    checkVotes();
  }, [elections, user]);

  const activeElections = elections.filter(e => e.status === 'active');
  const closedElections = elections.filter(e => e.status === 'closed');
  const votedCount = Object.values(voteStatuses).filter(Boolean).length;

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Summary Strip */}
      <div className="bg-brand-600 text-white px-5 py-3 flex justify-between items-center text-sm font-medium shadow-inner">
        <span>{activeElections.length} Active Elections</span>
        <span>{votedCount} Voted</span>
      </div>

      <div className="p-4 space-y-6">
        {/* Active Section */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3 px-1">Active Elections</h2>
          
          {activeElections.length === 0 ? (
            <EmptyState 
              title="No Active Elections" 
              description="There are currently no active elections available for your category."
            />
          ) : (
            <div className="space-y-3">
              {activeElections.map(election => (
                <ElectionCard
                  key={election.id}
                  election={election}
                  hasVoted={voteStatuses[election.id]}
                  onClick={() => navigate(ROUTES.ELECTION_DETAIL.replace(':id', election.id))}
                />
              ))}
            </div>
          )}
        </section>

        {/* Closed Section */}
        {closedElections.length > 0 && (
          <section>
            <button 
              onClick={() => setShowClosed(!showClosed)}
              className="flex items-center justify-between w-full px-1 py-2 text-lg font-bold text-gray-900 mb-2 hover:opacity-80 transition-opacity"
            >
              <span>Closed Elections</span>
              {showClosed ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            
            {showClosed && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                {closedElections.map(election => (
                  <ElectionCard
                    key={election.id}
                    election={election}
                    hasVoted={voteStatuses[election.id]}
                    onClick={() => navigate(ROUTES.ELECTION_DETAIL.replace(':id', election.id))}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
