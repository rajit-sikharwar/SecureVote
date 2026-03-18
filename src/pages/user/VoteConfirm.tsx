import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useElections } from '@/hooks/useElections';
import { useCandidates } from '@/hooks/useCandidates';
import { castVote } from '@/services/vote.service';
import { getFirebaseError } from '@/lib/errors';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { VoteReceiptModal } from '@/components/shared/VoteReceiptModal';
import { Skeleton } from '@/components/ui/Skeleton';

export default function VoteConfirm() {
  const { electionId, candidateId } = useParams<{
    electionId: string;
    candidateId: string;
  }>();

  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { elections, loading: loadingElections } = useElections();
  const { candidates, loading: loadingCandidates } = useCandidates(
    electionId || '',
    user?.category
  );

  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);

  const election = elections.find((e) => e.id === electionId);
  const candidate = candidates.find((c) => c.id === candidateId);

  useEffect(() => {
    if (!loadingElections && !loadingCandidates) {
      if (!election || !candidate || election.status !== 'active') {
        toast.error('Invalid vote request.');
        navigate(ROUTES.USER_HOME, { replace: true });
      }
    }
  }, [loadingElections, loadingCandidates, election, candidate, navigate]);

  if (loadingElections || loadingCandidates || !election || !candidate) {
    return (
      <div className="p-6 pt-12 flex flex-col items-center">
        <Skeleton variant="avatar" className="h-20 w-20 mb-6" />
        <Skeleton variant="text" className="w-48 mb-2 h-6" />
        <Skeleton variant="text" className="w-32 mb-8" />
        <Skeleton variant="card" className="w-full h-24 mb-6" />
        <div className="flex gap-4 w-full">
          <Skeleton variant="text" className="flex-1 h-12" />
          <Skeleton variant="text" className="flex-1 h-12" />
        </div>
      </div>
    );
  }

  const handleVote = async () => {
    if (!user || !user.category) return;

    setSubmitting(true);

    try {
      const receiptHash = await castVote(
        user.uid,
        election.id,
        candidate.id,
        user.category
      );

      setReceipt(receiptHash);
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        err.message === 'already-exists'
      ) {
        toast.error('You have already voted in this election.');
        navigate(ROUTES.USER_HOME, { replace: true });
      } else {
        const message =
          err instanceof Error
            ? getFirebaseError((err as { code?: string }).code ?? err.message)
            : 'Failed to cast vote';

        toast.error(message);
      }

      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full pb-6 bg-white relative">
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          disabled={submitting || !!receipt}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 py-6 flex flex-col items-center text-center">
        <Avatar
          src={candidate.photoURL}
          fallback={candidate.fullName}
          size="xl"
          className="mb-4 shadow-sm border-4 border-white ring-4 ring-brand-50"
        />

        <p className="text-gray-500 font-medium mb-1 uppercase tracking-wider text-xs">
          You are voting for:
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {candidate.fullName}
        </h2>

        <p className="text-brand-600 font-medium mb-4">
          {candidate.department}
        </p>

        <p className="text-gray-600 text-sm px-4 line-clamp-3 mb-8">
          "{candidate.bio}"
        </p>

        <div className="w-full h-px bg-gray-100 mb-8" />

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-left w-full mb-8">
          <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />

          <div>
            <h4 className="text-amber-900 font-semibold text-sm mb-1">
              This action is permanent
            </h4>

            <p className="text-amber-800 text-sm leading-relaxed">
              Your vote cannot be changed or undone after submission.
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            className="flex-[0.45]"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            variant="success"
            className="flex-1 shadow-lg shadow-emerald-500/20"
            onClick={handleVote}
            loading={submitting}
          >
            Confirm My Vote
          </Button>
        </div>
      </div>

      <Modal isOpen={!!receipt} onClose={() => {}} maxWidth="md">
        {receipt && <VoteReceiptModal receiptHash={receipt} />}
      </Modal>
    </div>
  );
}
