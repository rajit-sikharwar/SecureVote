import { useNavigate } from 'react-router-dom';
import { Calendar, Key, Copy, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/constants/routes';
import { toDate } from '@/lib/dates';
import { getUserVotesDetailed } from '@/services/vote.service';
import type { VoteDetails } from '@/types';
import { useEffect, useState } from 'react';

export default function MyVotes() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [enrichedVotes, setEnrichedVotes] = useState<VoteDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const formatVoteDate = (castedAt: string): string => {
    const date = toDate(castedAt);
    return date
      ? format(date, 'PPP')
      : 'Date unavailable';
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!user?.uid) {
        setEnrichedVotes([]);
        setLoading(false);
        return;
      }

      try {
        const enriched = await getUserVotesDetailed(user.uid);
        setEnrichedVotes(enriched);
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchDetails();
  }, [user?.uid]);

  const CopyableHash = ({ hash }: { hash: string }) => {
    const [copied, setCopied] = useState(false);

    const onCopy = () => {
      navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="flex items-center justify-between bg-white mt-3 p-2 border border-gray-100 rounded">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <Key className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="text-xs font-mono text-gray-600 truncate">{hash}</span>
        </div>

        <button
          onClick={onCopy}
          className="p-1.5 shrink-0 text-brand-600 hover:bg-brand-50 rounded ml-2"
        >
          {copied ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold mb-6">My Votes</h1>
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-32" />
      </div>
    );
  }

  return (
    <div className="p-4 pt-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6 px-1">My Votes</h1>

      {enrichedVotes.length === 0 ? (
        <EmptyState
          title="No Votes Cast"
          description="You haven't participated in any elections yet. Active elections will appear on your Home tab."
          actionLabel="Go to Home"
          onAction={() => navigate(ROUTES.USER_HOME)}
        />
      ) : (
        <div className="space-y-4">
          {enrichedVotes.map((vote) => (
            <div
              key={vote.id}
              className="bg-white border text-gray-900 border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-50 to-transparent -mr-2 -mt-2 rounded-xl" />

              <h3 className="font-bold text-lg leading-tight mb-2 pr-4">
                {vote.electionName}
              </h3>

              <p className="text-sm text-gray-600 mb-3 flex items-center">
                <span className="font-medium text-gray-900 mr-1.5">
                  Voted for:
                </span>
                {vote.candidateName}
              </p>

              <div className="flex items-center text-xs text-gray-500 justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatVoteDate(vote.castedAt)}
                </div>
              </div>

              <CopyableHash hash={vote.receiptHash} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
