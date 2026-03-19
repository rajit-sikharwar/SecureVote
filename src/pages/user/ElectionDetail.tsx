import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { getElectionWithCandidates } from '@/services/election.service';
import { hasVoted } from '@/services/vote.service';
import { toDate } from '@/lib/dates';
import { ROUTES } from '@/constants/routes';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { getCourseInfo } from '@/constants/academic';
import type { ElectionWithCandidates } from '@/types';

export default function ElectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [election, setElection] = useState<ElectionWithCandidates | null>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState<boolean>(false);

  useEffect(() => {
    if (!id || !user) return;

    const loadData = async () => {
      try {
        const [electionData, hasUserVoted] = await Promise.all([
          getElectionWithCandidates(id),
          hasVoted(user.uid, id)
        ]);

        setElection(electionData);
        setVoted(hasUserVoted);
      } catch (error) {
        console.error('Failed to load election:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user]);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-48" />
        <Skeleton variant="card" className="h-48" />
      </div>
    );
  }

  if (!election || !user) {
    return (
      <div className="p-4 mt-10">
        <EmptyState
          title="Election Not Found"
          description="This election may have been deleted or you don't have access to it."
        />
        <button
          className="text-indigo-600 font-medium mt-4 mx-auto block hover:underline"
          onClick={() => navigate(ROUTES.STUDENT_HOME)}
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  const now = new Date();
  const startTime = new Date(election.startTime);
  const endTime = new Date(election.endTime);

  const isActive = now >= startTime &&   now <= endTime;
  const hasEnded = now > endTime;
  const notStarted = now < startTime;

  const courseInfo = getCourseInfo(election.course);
  const showResults = voted || hasEnded;

  const handleVote = (candidateId: string) => {
    if (voted || hasEnded || notStarted) return;
    navigate(
      ROUTES.VOTE_CONFIRM
        .replace(':electionId', election.id)
        .replace(':candidateId', candidateId)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(ROUTES.STUDENT_HOME)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-xl text-gray-900 truncate flex-1">
            {election.title}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Election Info Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-wrap gap-2 mb-4">
            {isActive && !voted && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                Active - Vote Now
              </span>
            )}
            {voted && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                <CheckCircle className="h-4 w-4 mr-1.5" />
                You Voted
              </span>
            )}
            {hasEnded && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                Election Ended
              </span>
            )}
            {notStarted && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                Upcoming
              </span>
            )}

            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
              {courseInfo?.label || election.course} Year {election.year} Sec {election.section}
            </span>
          </div>

          <p className="text-gray-600 mb-4">
            {election.description}
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <div>
                <div className="font-medium text-gray-900">Starts</div>
                <div>{format(toDate(election.startTime) ?? new Date(), 'MMM d, h:mm a')}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <div>
                <div className="font-medium text-gray-900">Ends</div>
                <div>{format(toDate(election.endTime) ?? new Date(), 'MMM d, h:mm a')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Voting Message */}
        {voted && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5 text-center">
            <CheckCircle className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">You've Already Voted!</h3>
            <p className="text-gray-600 text-sm">
              Your vote has been recorded. You cannot vote again in this election.
            </p>
          </div>
        )}

        {notStarted && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
            <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">Election Not Started</h3>
            <p className="text-gray-600 text-sm">
              This election will begin on {format(startTime, 'MMMM d, yyyy')} at {format(startTime, 'h:mm a')}
            </p>
          </div>
        )}

        {/* Candidates Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {showResults ? 'Election Results' : 'Select Your Candidate'}
          </h2>

          {election.candidates.length === 0 ? (
            <EmptyState
              title="No Candidates Yet"
              description="Candidates have not been added to this election yet."
              icon={<Users className="h-12 w-12 text-gray-400" />}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {election.candidates.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => handleVote(candidate.id)}
                  disabled={voted || hasEnded || notStarted}
                  className={`bg-white rounded-2xl border-2 p-6 text-left transition-all ${
                    voted || hasEnded || notStarted
                      ? 'border-gray-200 cursor-not-allowed opacity-75'
                      : 'border-gray-200 hover:border-indigo-400 hover:shadow-lg cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Avatar
                      src={candidate.photoURL}
                      fallback={candidate.name}
                      size="lg"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {candidate.name}
                      </h3>

                      <p className="text-sm text-gray-600 line-clamp-3">
                        {candidate.description}
                      </p>

                      {!voted && !hasEnded && !notStarted && (
                        <div className="mt-4">
                          <span className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold">
                            Vote for {candidate.name.split(' ')[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
