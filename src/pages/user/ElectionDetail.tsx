import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft,Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { useElections } from '@/hooks/useElections';
import { useCandidates } from '@/hooks/useCandidates';
import { hasVoted } from '@/services/vote.service';
import { ROUTES } from '@/constants/routes';
import { CandidateCard } from '@/components/shared/CandidateCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { BottomSheet } from '@/components/ui/BottomSheet';
import type { Candidate } from '@/types';

export default function ElectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { elections, loading: loadingElections } = useElections();
  const election = elections.find(e => e.id === id);
  
  // Custom hook correctly applies category isolation automatically
  const { candidates, loading: loadingCandidates } = useCandidates(id || '', user?.category);
  
  const [voted, setVoted] = useState<boolean | null>(null);
  const [selectedBio, setSelectedBio] = useState<Candidate | null>(null);

  useEffect(() => {
    if (!user || !id) return;
    hasVoted(user.uid, id).then(setVoted);
  }, [user, id]);

  if (loadingElections || loadingCandidates || voted === null) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-8 w-8 bg-gray-200 rounded-full mb-6"></div>
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    );
  }

  if (!election) {
    return (
      <div className="p-4 mt-10">
        <EmptyState title="Election Not Found" description="This election may have been deleted or you don't have access to it." />
        <button className="text-brand-600 font-medium mt-4 mx-auto block" onClick={() => navigate(ROUTES.USER_HOME)}>
          ← Back to Home
        </button>
      </div>
    );
  }

  const isClosed = election.status === 'closed';
  const showResults = voted || isClosed;

  // We need total votes of CANDIDATES OF THIS CATEGORY to calculate correct percentages for progress bars
  const categoryTotalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

  // If showing results, sort candidates by votes
  const displayCandidates = showResults 
    ? [...candidates].sort((a, b) => b.voteCount - a.voteCount)
    : candidates;

  const winnerId = showResults && categoryTotalVotes > 0 ? displayCandidates[0]?.id : null;

  return (
    <div className="min-h-full pb-6">
      {/* Header element */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3 sticky top-0 bg-white z-10 border-b border-gray-100">
        <button 
          onClick={() => navigate(ROUTES.USER_HOME)}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-bold text-lg text-gray-900 truncate flex-1">
          {election.title}
        </h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Election Info Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex flex-wrap gap-2 mb-3">
             <StatusBadge status={election.status} />
             {election.eligibleCategories.map(cat => (
               <CategoryBadge key={cat} category={cat} />
             ))}
          </div>
          
          <p className="text-gray-600 text-sm mb-4">
            {election.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 flex-1 justify-center border-r border-gray-200">
              <Calendar className="h-4 w-4" />
              <span>{format(election.endDate.toDate(), 'MMM d')}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-1 justify-center">
              <Users className="h-4 w-4" />
              <span>{categoryTotalVotes} votes</span>
            </div>
          </div>
        </div>

        {/* Candidates Section */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">
            {showResults ? 'Results' : 'Candidates'}
          </h2>

          {candidates.length === 0 ? (
            <EmptyState 
              title="No Candidates Yet" 
              description="Candidates for your category have not been added to this election yet."
            />
          ) : (
            <div className="space-y-4">
              {displayCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  hasVoted={showResults}
                  totalVotes={categoryTotalVotes}
                  isWinner={showResults && candidate.id === winnerId}
                  onViewBio={() => setSelectedBio(candidate)}
                  onVoteClick={() => navigate(ROUTES.VOTE_CONFIRM.replace(':electionId', election.id).replace(':candidateId', candidate.id))}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bio Bottom Sheet */}
      <BottomSheet isOpen={!!selectedBio} onClose={() => setSelectedBio(null)}>
        {selectedBio && (
          <div>
            <div className="mb-6">
               <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedBio.fullName}</h3>
               <p className="text-brand-600 font-medium">{selectedBio.department}</p>
            </div>
            
            <div className="space-y-4 text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1 uppercase tracking-wider">Biography</h4>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{selectedBio.bio}</p>
              </div>
              
              {selectedBio.manifesto && (
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1 uppercase tracking-wider">Manifesto</h4>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{selectedBio.manifesto}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
