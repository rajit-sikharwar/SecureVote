import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { listAllCandidates, deleteCandidate } from '@/services/candidate.service';
import { ROUTES } from '@/constants/routes';
import { COURSES, SECTIONS } from '@/constants/academic';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { getCourseInfo } from '@/constants/academic';
import type { Candidate } from '@/types';

export default function AdminCandidates() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Candidate | null>(null);

  // Filters
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('');

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await listAllCandidates();
      setCandidates(data);
    } catch (error) {
      console.error('Failed to load candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      await deleteCandidate(deleting.id);
      await loadCandidates();
      toast.success('Candidate profile deleted successfully.');
      setDeleting(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error deleting candidate';

      toast.error(message);
    }
  };

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    if (filterCourse && c.course !== filterCourse) return false;
    if (filterSection && c.section !== filterSection) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="card" className="h-16" />
        <Skeleton variant="card" className="h-16" />
        <Skeleton variant="card" className="h-16" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Candidate Profiles
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {candidates.length} total candidate{candidates.length !== 1 ? 's' : ''} • {filteredCandidates.length} shown
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => navigate(ROUTES.ADMIN_ADD_CANDIDATE)}
        >
          Create Candidate Profile
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course
            </label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Courses</option>
              {COURSES.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Sections</option>
              {SECTIONS.map((section) => (
                <option key={section.value} value={section.value}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>

          {(filterCourse || filterSection) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterCourse('');
                  setFilterSection('');
                }}
                className="h-11 px-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {filteredCandidates.length === 0 ? (
        <EmptyState
          title={candidates.length === 0 ? "No Candidate Profiles" : "No Candidates Match Filters"}
          description={
            candidates.length === 0
              ? "Create candidate profiles that can be reused across multiple elections."
              : "Try adjusting your filters to see more candidates."
          }
          actionLabel={candidates.length === 0 ? "Create First Candidate" : undefined}
          onAction={candidates.length === 0 ? () => navigate(ROUTES.ADMIN_ADD_CANDIDATE) : undefined}
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Candidate</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Academic Info</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Description</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredCandidates.map((candidate) => {
                    const courseInfo = getCourseInfo(candidate.course);

                    return (
                      <tr
                        key={candidate.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar
                              src={candidate.photoURL}
                              fallback={candidate.name}
                              size="sm"
                            />

                            <span className="font-semibold text-gray-900 truncate">
                              {candidate.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 whitespace-nowrap">
                              {courseInfo?.label || candidate.course}
                            </span>
                            <span className="text-gray-400 hidden sm:inline">•</span>
                            <span className="text-xs text-gray-600 whitespace-nowrap">
                              Year {candidate.year}
                            </span>
                            <span className="text-gray-400 hidden sm:inline">•</span>
                            <span className="text-xs text-gray-600 whitespace-nowrap">
                              Sec {candidate.section}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 max-w-xs sm:max-w-md">
                            {candidate.description}
                          </p>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                          <button
                            onClick={() => setDeleting(candidate)}
                            className="p-2.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Candidate"
                            aria-label="Delete candidate"
                          >
                            <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Candidate Profile"
        message={
          <>
            Are you sure you want to delete the profile for
            <strong> {deleting?.name}</strong>?
            <br />
            <br />
            This will remove the candidate from all elections they're part of. This action cannot be undone.
          </>
        }
        variant="danger"
        confirmLabel="Delete Profile"
      />
    </div>
  );
}
