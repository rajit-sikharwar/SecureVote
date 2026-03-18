import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Info, Camera, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useElections } from '@/hooks/useElections';
import { addCandidate } from '@/services/candidate.service';
import { ROUTES } from '@/constants/routes';
import { CATEGORIES } from '@/constants/categories';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import ProfilePictureModal from '@/components/shared/ProfilePictureModal';
import type { UserCategory } from '@/types';

const schema = z.object({
  electionId: z.string().min(1, 'Select an election'),
  category: z.string().min(1, 'Select a candidate category'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  department: z.string().min(2, 'Department is required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(280, 'Bio max 280 characters'),
  manifesto: z.string().max(600, 'Manifesto max 600 characters').optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddCandidate() {

  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { elections } = useElections();

  const [loading, setLoading] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const selectedElectionId = watch('electionId');

  const activeElections = elections.filter(e => e.status !== 'closed');

  const electionOptions = activeElections.map(e => ({
    value: e.id,
    label: e.title,
  }));

  const selectedElection = activeElections.find(e => e.id === selectedElectionId);

  const categoryOptions = useMemo(() => {

    if (!selectedElection) return [];

    return selectedElection.eligibleCategories.map(catId => {
      const c = CATEGORIES.find(x => x.id === catId);

      return {
        value: catId,
        label: c ? `${c.emoji} ${c.label}` : catId,
      };
    });

  }, [selectedElection]);

  const onSubmit = async (data: FormData) => {

    if (!user) return;

    setLoading(true);

    try {

      const q = query(
        collection(db, 'candidates'),
        where('electionId', '==', data.electionId)
      );

      const snap = await getDocs(q);

      if (snap.size >= 10) {

        toast.error('This election has reached the maximum limit of 10 candidates.');
        setLoading(false);
        return;

      }

      await addCandidate({

        electionId: data.electionId,
        category: data.category as UserCategory,
        fullName: data.fullName,
        department: data.department,
        bio: data.bio,
        manifesto: data.manifesto,
        photoURL: photoBase64 || undefined,
        addedBy: user.uid,

      });

      toast.success('Candidate added successfully!');
      navigate(ROUTES.ADMIN_CANDIDATES);

    } catch (err: unknown) {

      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to add candidate');
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
          Add Candidate
        </h1>

      </div>

      <Card className="p-6">

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {activeElections.length === 0 ? (

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-800">

              <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />

              <p>
                <strong>No active elections found.</strong>
                Please create or activate an election before adding candidates.
              </p>

            </div>

          ) : (

            <Select
              label="Target Election"
              {...register('electionId')}
              options={electionOptions}
              error={errors.electionId?.message}
            />

          )}

          {selectedElection && (

            <div className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <Select
                  label="Candidate Category"
                  {...register('category')}
                  options={categoryOptions}
                  error={errors.category?.message}
                />

                <Input
                  label="Full Name"
                  placeholder="Jane Doe"
                  {...register('fullName')}
                  error={errors.fullName?.message}
                />

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <Input
                  label="Department / Area"
                  placeholder="Computer Science / Class 10A"
                  {...register('department')}
                  error={errors.department?.message}
                />

                <div className="flex flex-col gap-1.5">

                  <span className="text-sm font-medium text-gray-700">
                    Candidate Photo (optional)
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="flex items-center gap-3 px-3 py-2 border border-gray-300 rounded-xl hover:border-brand-400 hover:bg-brand-50 transition-colors text-sm text-gray-600"
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

              </div>

              <Textarea
                label="Biography"
                {...register('bio')}
                error={errors.bio?.message}
                rows={3}
              />

              <Textarea
                label="Manifesto"
                {...register('manifesto')}
                error={errors.manifesto?.message}
                rows={5}
              />

              <div className="pt-4 flex justify-end gap-3">

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
                  Add Candidate
                </Button>

              </div>

            </div>

          )}

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
