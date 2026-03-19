import { useNavigate } from 'react-router-dom';
import { Calendar, Vote } from 'lucide-react';
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

  const [votes, setVotes] = useState<VoteDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const formatVoteDate = (createdAt: string): string => {
    const date = toDate(createdAt);
    return date ? format(date, 'PPP') : 'Date unavailable';
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!user?.uid) {
        setVotes([]);
        setLoading(false);
        return;
      }

      try {
        const voteData = await getUserVotesDetailed(user.uid);
        setVotes(voteData);
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchDetails();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-6">My Voting History</h1>
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-32" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Vote className="h-8 w-8 text-indigo-600" />
            My Voting History
          </h1>
          <p className="text-gray-600">
            View all elections you've participated in
          </p>
        </div>

        {votes.length === 0 ? (
          <EmptyState
            title="No Votes Cast"
            description="You haven't participated in any elections yet. Active elections will appear on your Home page."
            actionLabel="Go to Home"
            onAction={() => navigate(ROUTES.STUDENT_HOME)}
            icon={<Vote className="h-12 w-12 text-gray-400" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {votes.map((vote) => (
              <div
                key={vote.id}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 mb-3">
                    ✓ Voted
                  </span>

                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {vote.electionTitle}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatVoteDate(vote.createdAt)}</span>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <p className="text-xs font-medium text-indigo-900 mb-1">
                    Your Vote
                  </p>
                  <p className="text-base font-bold text-indigo-700">
                    {vote.candidateName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
