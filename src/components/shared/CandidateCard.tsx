import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { ProgressBar } from '../ui/ProgressBar';
import type { Candidate } from '@/types';

interface CandidateCardProps {
  candidate: Candidate;
  totalVotes?: number;
  hasVoted?: boolean;
  isWinner?: boolean;
  onVoteClick?: () => void;
  onViewBio?: () => void;
}

export function CandidateCard({ 
  candidate, 
  totalVotes = 0, 
  hasVoted, 
  isWinner,
  onVoteClick, 
  onViewBio 
}: CandidateCardProps) {
  const percent = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;

  return (
    <Card className="p-4 flex flex-col h-full border-2 border-transparent transition-colors hover:border-gray-100">
      <div className="flex gap-4 items-start mb-3">
        <Avatar 
          src={candidate.photoURL} 
          fallback={candidate.fullName} 
          size="lg"
          className="shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 leading-tight truncate">
            {candidate.fullName}
            {isWinner && <span className="ml-2" title="Your Vote">✓</span>}
          </h4>
          <p className="text-sm text-gray-500 truncate">{candidate.department}</p>
        </div>
      </div>

      {!hasVoted && (
        <>
          <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
            {candidate.bio}
          </p>
          <div className="flex gap-2 mt-auto">
            <Button variant="outline" size="sm" className="flex-1" onClick={onViewBio}>
              Info
            </Button>
            <Button variant="primary" size="sm" className="flex-1" onClick={onVoteClick}>
              Vote →
            </Button>
          </div>
        </>
      )}

      {hasVoted && (
        <div className="mt-2 text-sm text-gray-600 space-y-2 flex-1">
           <ProgressBar 
              percent={percent} 
              count={candidate.voteCount} 
              color={isWinner ? "#10B981" : "#6366F1"}
           />
        </div>
      )}
    </Card>
  );
}
