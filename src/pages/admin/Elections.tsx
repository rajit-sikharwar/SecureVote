import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Power, PowerOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useElections } from '@/hooks/useElections';
import { updateElectionStatus, deleteElection } from '@/services/election.service';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';
import { ElectionCard } from '@/components/shared/ElectionCard';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Election } from '@/types';

export default function AdminElections() {

  const { elections, loading } = useElections();
  const navigate = useNavigate();

  const [deleting, setDeleting] = useState<Election | null>(null);
  const [toggling, setToggling] = useState<Election | null>(null);

  const handleDelete = async () => {

    if (!deleting) return;

    try {

      await deleteElection(deleting.id);
      toast.success('Election deleted successfully.');
      setDeleting(null);

    } catch (err: unknown) {

      const message =
        err instanceof Error
          ? err.message
          : 'Error deleting election';

      toast.error(message);

    }

  };

  const handleToggle = async () => {

    if (!toggling) return;

    try {

      const newStatus = toggling.status === 'active' ? 'closed' : 'active';

      await updateElectionStatus(toggling.id, newStatus);

      toast.success(
        `Election ${newStatus === 'active' ? 'activated' : 'closed'} successfully.`
      );

      setToggling(null);

    } catch (err: unknown) {

      const message =
        err instanceof Error
          ? err.message
          : 'Error updating status';

      toast.error(message);

    }

  };

  if (loading) {

    return (

      <div className="space-y-6">

        <div className="flex justify-between items-center mb-6">
          <Skeleton variant="text" className="w-32 h-8" />
          <Skeleton variant="text" className="w-32 h-10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton variant="card" className="h-48" />
          <Skeleton variant="card" className="h-48" />
        </div>

      </div>

    );

  }

  return (

    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

        <h1 className="text-2xl font-bold text-gray-900">
          Elections
        </h1>

        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => navigate(ROUTES.ADMIN_CREATE_ELECTION)}
        >
          Create Election
        </Button>

      </div>

      {elections.length === 0 ? (

        <EmptyState
          title="No Elections Found"
          description="Create your first election to get started setting up candidates and voting."
          actionLabel="Create Election"
          onAction={() => navigate(ROUTES.ADMIN_CREATE_ELECTION)}
        />

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {elections.map((election) => (

            <div key={election.id} className="relative group">

              <ElectionCard election={election} isAdmin={true} />

              <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                <button
                  onClick={() => setToggling(election)}
                  className="p-1.5 rounded bg-white shadow-sm hover:bg-gray-50 border border-gray-200 text-gray-600 hover:text-brand-600 transition-colors"
                  title={
                    election.status === 'active'
                      ? 'Close Election'
                      : 'Activate Election'
                  }
                >

                  {election.status === 'active'
                    ? <PowerOff className="h-4 w-4" />
                    : <Power className="h-4 w-4" />}

                </button>

                <button
                  onClick={() => setDeleting(election)}
                  className="p-1.5 rounded bg-white shadow-sm hover:bg-red-50 border border-gray-200 text-gray-600 hover:text-red-600 transition-colors"
                  title="Delete Election"
                >

                  <Trash2 className="h-4 w-4" />

                </button>

              </div>

            </div>

          ))}

        </div>

      )}

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Election"
        message={
          <>
            Are you sure you want to delete
            <strong> {deleting?.title} </strong>?
            This will permanently remove the election.
            Votes and candidates associated with this election will become orphaned.
          </>
        }
        variant="danger"
        confirmLabel="Delete"
      />

      <ConfirmDialog
        isOpen={!!toggling}
        onClose={() => setToggling(null)}
        onConfirm={handleToggle}
        title={`${toggling?.status === 'active' ? 'Close' : 'Activate'} Election`}
        message={
          <>
            Are you sure you want to
            <strong>
              {' '}
              {toggling?.status === 'active' ? 'close' : 'activate'}{' '}
            </strong>
            {toggling?.title}?{' '}
            {toggling?.status === 'active'
              ? 'Voters will no longer be able to cast votes.'
              : 'Voters will be able to cast votes immediately.'}
          </>
        }
        variant={toggling?.status === 'active' ? 'danger' : 'primary'}
        confirmLabel="Confirm"
      />

    </div>

  );

}
