import { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { getElectionWithCandidates } from '@/services/election.service';
import { castVote } from '@/services/vote.service';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { VotingAnimation } from '@/components/three/VotingAnimation';
import type { ElectionWithCandidates, Candidate } from '@/types';

export default function VoteConfirm() {
  const { electionId, candidateId } = useParams<{
    electionId: string;
    candidateId: string;
  }>();

  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [election, setElection] = useState<ElectionWithCandidates | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!electionId || !candidateId || !user) return;

    const loadData = async () => {
      try {
        const electionData = await getElectionWithCandidates(electionId);
        const candidateData = electionData?.candidates.find(c => c.id === candidateId);

        if (!electionData || !candidateData) {
          toast.error('Invalid election or candidate');
          navigate(ROUTES.STUDENT_HOME, { replace: true });
          return;
        }

        setElection(electionData);
        setCandidate(candidateData);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load election details');
        navigate(ROUTES.STUDENT_HOME, { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [electionId, candidateId, user, navigate]);

  if (loading || !election || !candidate || !user) {
    return (
      <div className="p-6 pt-12 flex flex-col items-center">
        <Skeleton variant="avatar" className="h-20 w-20 mb-6" />
        <Skeleton variant="text" className="w-48 mb-2 h-6" />
        <Skeleton variant="text" className="w-32 mb-8" />
        <Skeleton variant="card" className="w-full h-24 mb-6" />
      </div>
    );
  }

  const handleVote = async () => {
    if (!user) return;

    setSubmitting(true);

    try {
      await castVote(user.uid, election.id, candidate.id);
      setSuccess(true);
      toast.success('Vote cast successfully!');

      // Navigate to home after 3 seconds
      setTimeout(() => {
        navigate(ROUTES.STUDENT_HOME, { replace: true });
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cast vote';
      toast.error(message);
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* 3D Success Animation */}
          <div className="h-64 mb-6">
            <Suspense fallback={<div className="h-full bg-white/50 rounded-2xl animate-pulse" />}>
              <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 6]} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, 0, -5]} intensity={0.8} color="#10b981" />
                <VotingAnimation />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
              </Canvas>
            </Suspense>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-5">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Vote Recorded!
            </h2>

            <p className="text-gray-600 mb-6">
              Your vote for <strong>{candidate.name}</strong> has been successfully recorded in {election.title}.
            </p>

            <p className="text-sm text-gray-500">
              Redirecting you to home...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-xl text-gray-900">
            Confirm Your Vote
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Warning Card */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 flex gap-4">
          <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900 mb-1">Important Notice</h3>
            <p className="text-sm text-amber-800">
              Once you submit your vote, you cannot change it. Please review your selection carefully before confirming.
            </p>
          </div>
        </div>

        {/* Election Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Election</h3>
          <p className="text-lg font-bold text-gray-900">{election.title}</p>
        </div>

        {/* Candidate Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 p-6 shadow-lg">
          <div className="flex items-center gap-2 text-indigo-700 mb-4">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold">YOUR VOTE FOR</span>
          </div>

          <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
            <Avatar
              src={candidate.photoURL}
              fallback={candidate.name}
              size="lg"
            />

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {candidate.name}
              </h2>
              <p className="text-gray-600 text-sm line-clamp-2">
                {candidate.description}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="flex-1"
          >
            Go Back
          </Button>

          <Button
            variant="primary"
            onClick={handleVote}
            loading={submitting}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            {submitting ? 'Submitting Vote...' : 'Confirm & Submit Vote'}
          </Button>
        </div>

        <p className="text-center text-xs text-gray-500">
          By confirming, you agree that this vote is final and cannot be changed.
        </p>
      </div>
    </div>
  );
}
