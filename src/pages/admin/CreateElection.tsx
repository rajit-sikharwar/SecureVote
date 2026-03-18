import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { createElection } from '@/services/election.service';
import { ROUTES } from '@/constants/routes';
import { CATEGORIES } from '@/constants/categories';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { UserCategory } from '@/types';

const schema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(500),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    eligibleCategories: z
      .array(z.string())
      .min(1, 'Select at least one category'),
    status: z.enum(['active', 'draft', 'closed']),
  })
  .refine((d) => new Date(d.endDate) > new Date(d.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

type FormData = z.infer<typeof schema>;

export default function CreateElection() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'draft',
      eligibleCategories: [],
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    setLoading(true);

    try {
      await createElection({
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        eligibleCategories: data.eligibleCategories as UserCategory[],
        status: data.status,
        createdBy: user.uid,
      });

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
    <div className="max-w-2xl mx-auto space-y-6">
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <Input
            label="Election Title"
            placeholder="e.g. Student Council President 2026"
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
              {...register('startDate')}
              error={errors.startDate?.message}
            />

            <Input
              label="End Date & Time"
              type="datetime-local"
              {...register('endDate')}
              error={errors.endDate?.message}
            />

          </div>

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-3">
              Eligible Categories (Who can vote?)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {CATEGORIES.map((cat) => (

                <label
                  key={cat.id}
                  className="flex items-center p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors bg-white"
                >

                  <input
                    type="checkbox"
                    value={cat.id}
                    {...register('eligibleCategories')}
                    className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                  />

                  <span className="ml-3 font-medium text-gray-900 flex items-center gap-2">
                    {cat.emoji} {cat.label}
                  </span>

                </label>

              ))}

            </div>

            {errors.eligibleCategories && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.eligibleCategories.message}
              </p>
            )}

          </div>

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-3">
              Initial Status
            </label>

            <div className="flex gap-4">

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="draft"
                  {...register('status')}
                  className="text-brand-600"
                />
                <span className="text-sm font-medium">
                  Draft (Hidden)
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="active"
                  {...register('status')}
                  className="text-brand-600"
                />
                <span className="text-sm font-medium">
                  Active (Voting open instantly)
                </span>
              </label>

            </div>

            {errors.status && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.status.message}
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
