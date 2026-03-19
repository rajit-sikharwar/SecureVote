import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { createElection } from '@/services/election.service';
import { listCandidates } from '@/services/candidate.service';
import { ROUTES } from '@/constants/routes';
import { COURSES, ACADEMIC_YEARS, SECTIONS, getAllowedYears } from '@/constants/academic';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import type { Course, Candidate } from '@/types';

const schema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(500),
    course: z.string().min(1, 'Please select a course'),
    year: z.number().min(1).max(4),
    section: z.string().min(1, 'Please select a section'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    candidateIds: z.array(z.string()).min(2, 'Select at least 2 candidates'),
  })
  .refine((d) => new Date(d.endTime) > new Date(d.startTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

type FormData = z.infer<typeof schema>;

export default function CreateElection() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | ''>('');
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      year: 1,
      candidateIds: [],
    },
  });

  const watchedCourse = watch('course');
  const watchedYear = watch('year');
  const watchedSection = watch('section');

  // Get allowed years based on selected course
  const allowedYears = selectedCourse ? getAllowedYears(selectedCourse) : [1, 2, 3, 4];

  // Load all candidates
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const data = await listCandidates();
        setCandidates(data);
      } catch (error) {
        console.error('Failed to load candidates:', error);
        toast.error('Failed to load candidates');
      }
    };

    loadCandidates();
  }, []);

  // Filter candidates based on course/year/section
  useEffect(() => {
    if (watchedCourse && watchedYear && watchedSection) {
      const filtered = candidates.filter(
        c => c.course === watchedCourse && c.year === watchedYear && c.section === watchedSection
      );
      setFilteredCandidates(filtered);

      // Clear selected candidates if they're not in the filtered list
      setSelectedCandidateIds(prev =>
        prev.filter(id => filtered.some(c => c.id === id))
      );
    } else {
      setFilteredCandidates([]);
      setSelectedCandidateIds([]);
    }
  }, [watchedCourse, watchedYear, watchedSection, candidates]);

  // Update form candidateIds when selection changes
  useEffect(() => {
    setValue('candidateIds', selectedCandidateIds);
  }, [selectedCandidateIds, setValue]);

  const toggleCandidate = (candidateId: string) => {
    setSelectedCandidateIds(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        return [...prev, candidateId];
      }
    });
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    setLoading(true);

    try {
      await createElection(
        {
          title: data.title,
          description: data.description,
          course: data.course as Course,
          year: data.year as any,
          section: data.section as any,
          startTime: new Date(data.startTime).toISOString(),
          endTime: new Date(data.endTime).toISOString(),
          candidateIds: data.candidateIds,
        },
        user.uid
      );

      toast.success('Election created successfully!');
      navigate(ROUTES.ADMIN_ELECTIONS);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Creation failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          Create Election
        </h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Election Details
            </h2>

            <Input
              label="Election Title"
              placeholder="e.g. Class Representative Election 2026"
              {...register('title')}
              error={errors.title?.message}
            />

            <Textarea
              label="Description"
              placeholder="Explain the purpose of this election..."
              {...register('description')}
              error={errors.description?.message}
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date & Time"
                type="datetime-local"
                {...register('startTime')}
                error={errors.startTime?.message}
              />

              <Input
                label="End Date & Time"
                type="datetime-local"
                {...register('endTime')}
                error={errors.endTime?.message}
              />
            </div>
          </div>

          {/* Eligibility Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Eligibility (Who can vote?)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('course')}
                  onChange={(e) => {
                    register('course').onChange(e);
                    setSelectedCourse(e.target.value as Course);
                    setValue('year', 1);
                  }}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Course</option>
                  {COURSES.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.label}
                    </option>
                  ))}
                </select>
                {errors.course && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.course.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('year', { valueAsNumber: true })}
                  onChange={(e) => {
                    register('year', { valueAsNumber: true }).onChange(e);
                    setSelectedYear(parseInt(e.target.value));
                  }}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {allowedYears.map((year) => {
                    const yearInfo = ACADEMIC_YEARS.find(y => y.value === year);
                    return (
                      <option key={year} value={year}>
                        {yearInfo?.label || `Year ${year}`}
                      </option>
                    );
                  })}
                </select>
                {errors.year && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.year.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('section')}
                  onChange={(e) => {
                    register('section').onChange(e);
                    setSelectedSection(e.target.value);
                  }}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Section</option>
                  {SECTIONS.map((section) => (
                    <option key={section.value} value={section.value}>
                      {section.label}
                    </option>
                  ))}
                </select>
                {errors.section && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.section.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Candidate Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Candidates
              </h2>
              <span className="text-sm text-gray-500">
                {selectedCandidateIds.length} selected
              </span>
            </div>

            {!watchedCourse || !watchedYear || !watchedSection ? (
              <div className="text-center py-8 text-gray-500">
                Please select course, year, and section first to see available candidates
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No candidates available for {watchedCourse} Year {watchedYear} Section {watchedSection}.
                <br />
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.ADMIN_ADD_CANDIDATE)}
                  className="mt-2 text-indigo-600 hover:underline"
                >
                  Create a candidate profile first
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCandidates.map((candidate) => (
                  <label
                    key={candidate.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedCandidateIds.includes(candidate.id)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCandidateIds.includes(candidate.id)}
                      onChange={() => toggleCandidate(candidate.id)}
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />

                    <div className="flex items-start gap-3 flex-1">
                      <Avatar
                        src={candidate.photoURL}
                        fallback={candidate.name}
                        size="sm"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">
                          {candidate.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {candidate.description}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {errors.candidateIds && (
              <p className="mt-1.5 text-sm text-red-600">
                {errors.candidateIds.message}
              </p>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              Create Election
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
