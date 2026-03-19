import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Camera, User as UserIcon } from 'lucide-react';
import { createCandidate } from '@/services/candidate.service';
import { ROUTES } from '@/constants/routes';
import { COURSES, ACADEMIC_YEARS, SECTIONS, getAllowedYears } from '@/constants/academic';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import ProfilePictureModal from '@/components/shared/ProfilePictureModal';
import type { Course } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description max 500 characters'),
  course: z.string().min(1, 'Please select a course'),
  year: z.number().min(1).max(4),
  section: z.string().min(1, 'Please select a section'),
});

type FormData = z.infer<typeof schema>;

export default function AddCandidate() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | ''>('');

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
    },
  });

  // Commenting out unused variable for now
  // const watchedCourse = watch('course');

  // Get allowed years based on selected course
  const allowedYears = selectedCourse ? getAllowedYears(selectedCourse) : [1, 2, 3, 4];

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      await createCandidate({
        name: data.name,
        photoURL: photoBase64 || undefined,
        description: data.description,
        course: data.course as Course,
        year: data.year as any,
        section: data.section as any,
      });

      toast.success('Candidate profile created successfully!');
      navigate(ROUTES.ADMIN_CANDIDATES);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to create candidate');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          Create Candidate Profile
        </h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p>
              <strong>Note:</strong> Candidate profiles can be reused across multiple elections.
              Create profiles for all potential candidates, then select them when creating elections.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Basic Information
            </h2>

            <Input
              label="Candidate Name"
              placeholder="John Doe"
              {...register('name')}
              error={errors.name?.message}
            />

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700">
                Candidate Photo (optional)
              </span>

              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="flex items-center gap-3 px-3 py-2 border border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-sm text-gray-600"
              >
                {photoBase64 ? (
                  <img
                    src={photoBase64}
                    alt="Preview"
                    className="h-9 w-9 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                )}

                Upload Photo
                <Camera className="h-4 w-4 ml-auto text-gray-400" />
              </button>
            </div>

            <Textarea
              label="Description / Biography"
              placeholder="Describe the candidate's background, qualifications, and goals..."
              {...register('description')}
              error={errors.description?.message}
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Academic Information
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

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-600">
              <strong>Why these fields?</strong> Candidate profiles are tagged with course/year/section
              so they can be filtered when creating elections for specific classes.
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              Create Candidate Profile
            </Button>
          </div>
        </form>
      </Card>

      <ProfilePictureModal
        isOpen={showPhotoModal}
        title="Add Candidate Photo"
        onClose={() => setShowPhotoModal(false)}
        onSave={async (base64) => {
          setPhotoBase64(base64);
        }}
      />
    </div>
  );
}
