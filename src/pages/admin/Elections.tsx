import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Calendar, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useElections } from '@/hooks/useElections';
import { deleteElection } from '@/services/election.service';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { getCourseInfo } from '@/constants/academic';
import { toDate } from '@/lib/dates';
import type { Election } from '@/types';

export default function AdminElections() {
  const { elections, loading, refresh } = useElections();
  const navigate = useNavigate();

  const [deleting, setDeleting] = useState<Election | null>(null);

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      await deleteElection(deleting.id);
      await refresh();
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

  const getElectionStatus = (election: Election): 'upcoming' | 'active' | 'ended' => {
    const now = new Date();
    const start = new Date(election.startTime);
    const end = new Date(election.endTime);

    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'active';
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = toDate(dateString);
      return date ? format(date, 'MMM d, yyyy h:mm a') : 'Invalid date';
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton variant="text" className="w-32 h-8" />
          <Skeleton variant="text" className="w-32 h-10" />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-7 w-7 text-indigo-600" />
            Elections
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {elections.length} total election{elections.length !== 1 ? 's' : ''}
          </p>
        </div>

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
          description="Create your first election to get started with course-specific voting."
          actionLabel="Create Election"
          onAction={() => navigate(ROUTES.ADMIN_CREATE_ELECTION)}
        />
      ) : (
        <div className="space-y-4">
          {elections.map((election) => {
            const status = getElectionStatus(election);
            const courseInfo = getCourseInfo(election.course);

            return (
              <div
                key={election.id}
                className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {election.title}
                      </h3>

                      {status === 'active' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                          Active
                        </span>
                      )}

                      {status === 'upcoming' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                          Upcoming
                        </span>
                      )}

                      {status === 'ended' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          Ended
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4">
                      {election.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>
                          <strong className="text-gray-900">Eligible:</strong>{' '}
                          {courseInfo?.label || election.course} Year {election.year} Section {election.section}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          <strong className="text-gray-900">Start:</strong>{' '}
                          {formatDateTime(election.startTime)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          <strong className="text-gray-900">End:</strong>{' '}
                          {formatDateTime(election.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeleting(election)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                      title="Delete Election"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
            <strong> {deleting?.title}</strong>?
            <br />
            <br />
            This will permanently remove the election and all associated votes. This action cannot be undone.
          </>
        }
        variant="danger"
        confirmLabel="Delete Election"
      />
    </div>
  );
}
