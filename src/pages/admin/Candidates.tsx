import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useElections } from '@/hooks/useElections';
import { useCandidates } from '@/hooks/useCandidates';
import { deleteCandidate } from '@/services/candidate.service';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Candidate } from '@/types';

export default function AdminCandidates() {

  const navigate = useNavigate();
  const { elections, loading: loadingElections } = useElections();

  const [selectedElectionId, setSelectedElectionId] = useState<string>('');

  const { candidates, loading: loadingCandidates } =
    useCandidates(selectedElectionId, undefined, true);

  const [deleting, setDeleting] = useState<Candidate | null>(null);

  const handleDelete = async () => {

    if (!deleting) return;

    try {

      await deleteCandidate(deleting.id);

      toast.success('Candidate removed successfully.');
      setDeleting(null);

    } catch (err: unknown) {

      const message =
        err instanceof Error
          ? err.message
          : 'Error deleting candidate';

      toast.error(message);

    }

  };

  const electionOptions = elections.map(e => ({
    value: e.id,
    label: e.title + (e.status !== 'active' ? ` (${e.status})` : '')
  }));

  return (

    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">

        <h1 className="text-2xl font-bold text-gray-900">
          Candidates
        </h1>

        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => navigate(ROUTES.ADMIN_ADD_CANDIDATE)}
        >
          Add Candidate
        </Button>

      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm max-w-md">

        <Select
          label="Filter by Election"
          value={selectedElectionId}
          onChange={(e) => setSelectedElectionId(e.target.value)}
          options={electionOptions}
        />

      </div>

      {!selectedElectionId ? (

        <EmptyState
          title="Select an Election"
          description="Please select an election from the dropdown above to view or manage its candidates."
        />

      ) : loadingElections || loadingCandidates ? (

        <div className="space-y-4 pt-4">
          <Skeleton variant="card" className="h-16" />
          <Skeleton variant="card" className="h-16" />
          <Skeleton variant="card" className="h-16" />
        </div>

      ) : candidates.length === 0 ? (

        <EmptyState
          title="No Candidates Found"
          description="There are no candidates registered for this election yet."
          actionLabel="Add Candidate"
          onAction={() => navigate(ROUTES.ADMIN_ADD_CANDIDATE)}
        />

      ) : (

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm whitespace-nowrap">

              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">

                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4 text-center">Votes</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {candidates.map((candidate) => (

                  <tr
                    key={candidate.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <Avatar
                          src={candidate.photoURL}
                          fallback={candidate.fullName}
                          size="sm"
                        />

                        <span className="font-semibold text-gray-900">
                          {candidate.fullName}
                        </span>

                      </div>

                    </td>

                    <td className="px-6 py-4">
                      <CategoryBadge category={candidate.category} />
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {candidate.department}
                    </td>

                    <td className="px-6 py-4">

                      <div className="flex justify-center">

                        <span className="px-2.5 py-1 bg-brand-50 text-brand-700 font-bold rounded-lg min-w-[3rem] text-center">
                          {candidate.voteCount}
                        </span>

                      </div>

                    </td>

                    <td className="px-6 py-4 text-right">

                      <button
                        onClick={() => setDeleting(candidate)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Candidate"
                      >

                        <Trash2 className="h-4 w-4" />

                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Remove Candidate"
        message={
          <>
            Are you sure you want to remove
            <strong> {deleting?.fullName} </strong>
            from this election? This action cannot be undone.
          </>
        }
        variant="danger"
        confirmLabel="Remove Candidate"
      />

    </div>

  );

}
