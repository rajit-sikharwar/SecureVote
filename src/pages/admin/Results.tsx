import { useState } from 'react';
import { useElections } from '@/hooks/useElections';
import { useCandidates } from '@/hooks/useCandidates';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Trophy } from 'lucide-react';
import { CATEGORIES } from '@/constants/categories';

// Reusing same type alias interface to ensure code compiles cleanly
type CategoryId = string;

export default function AdminResults() {
  const { elections, loading: loadingElections } = useElections();
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  
  // load all candidates for the election (category = undefined meaning all)
  const { candidates, loading: loadingCandidates } = useCandidates(selectedElectionId, undefined, true);

  const loading = loadingElections || loadingCandidates;

  const electionOptions = elections.map(e => ({
    value: e.id,
    label: e.title + (e.status !== 'closed' ? ` (${e.status})` : ' - CLOSED')
  }));

  // Group candidates by category to calculate winner per category
  const candidatesByCategory = candidates.reduce((acc, candidate) => {
    const cat = candidate.category as CategoryId;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(candidate);
    return acc;
  }, {} as Record<CategoryId, typeof candidates>);



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Election Results</h1>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm max-w-md">
        <Select
          label="Select Election to view results"
          value={selectedElectionId}
          onChange={(e) => setSelectedElectionId(e.target.value)}
          options={electionOptions}
        />
      </div>

      {!selectedElectionId ? (
        <EmptyState 
          title="Select an Election" 
          description="Please select an election from the dropdown above to view the detailed results and statistics."
        />
      ) : loading ? (
        <div className="space-y-4 pt-4">
           <Skeleton variant="card" className="h-32" />
           <Skeleton variant="card" className="h-32" />
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState 
          title="No Candidates Found" 
          description="There is no data to display because no candidates were added to this election."
        />
      ) : (
        <div className="space-y-8">
          {/* Results grouped by Category */}
          {Object.entries(candidatesByCategory).map(([category, catCandidates]) => {
            const sumVotes = catCandidates.reduce((sum, c) => sum + c.voteCount, 0);
            const sortedCandidates = [...catCandidates].sort((a, b) => b.voteCount - a.voteCount);
            const highestVotes = sortedCandidates[0]?.voteCount || 0;
            const categoryMeta = CATEGORIES.find(c => c.id === category);

            return (
              <div key={category} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="text-3xl bg-gray-50 h-14 w-14 flex items-center justify-center rounded-xl border border-gray-100 shadow-inner">
                    {categoryMeta?.emoji || '📋'}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">
                      {categoryMeta?.label || category} Category
                    </h2>
                    <p className="text-sm font-medium text-gray-500">
                      Total Votes Cast: {sumVotes}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {sortedCandidates.map((candidate, index) => {
                    const isWinner = sumVotes > 0 && candidate.voteCount === highestVotes && highestVotes > 0;
                    const percent = sumVotes > 0 ? (candidate.voteCount / sumVotes) * 100 : 0;

                    return (
                      <div key={candidate.id} className={`p-4 rounded-xl border-2 transition-colors ${
                        isWinner ? 'bg-emerald-50/30 border-emerald-100' : 'bg-gray-50 border-transparent hover:border-gray-100'
                      }`}>
                        <div className="flex gap-4 items-center mb-3">
                          <div className={`font-mono text-xl font-bold ${
                            isWinner ? 'text-emerald-500' : 'text-gray-300'
                          }`}>
                            #{index + 1}
                          </div>
                          
                          <Avatar src={candidate.photoURL} fallback={candidate.fullName} size="md" />
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 leading-tight truncate flex items-center gap-2">
                              {candidate.fullName}
                              {isWinner && <Trophy className="h-4 w-4 text-amber-500 fill-amber-500" />}
                            </h4>
                            <p className="text-sm text-gray-500 truncate">{candidate.department}</p>
                          </div>

                          <div className="text-right pl-4">
                            <div className={`text-2xl font-black ${isWinner ? 'text-emerald-600' : 'text-gray-900'}`}>
                              {candidate.voteCount}
                            </div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                              Votes
                            </div>
                          </div>
                        </div>

                        <div className="pl-14">
                           <ProgressBar 
                              percent={percent} 
                              color={isWinner ? "#10B981" : "#6366F1"} 
                           />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
