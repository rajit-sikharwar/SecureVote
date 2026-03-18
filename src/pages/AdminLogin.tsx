import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { signInAdmin } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';
import { getFirebaseError } from '@/lib/errors';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function AdminLogin() {

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useRHForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email, password }: FormData) => {

    setLoading(true);

    try {

      const adminUser = await signInAdmin(email, password);

      setUser(adminUser);

      navigate(ROUTES.ADMIN_DASHBOARD);

    } catch (err: unknown) {

      let msg = 'Login failed';

      if (err instanceof Error) {

        msg = getFirebaseError(
          (err as { code?: string }).code ?? err.message
        );

        if (err.message.includes('authorized')) {
          setError('root', { message: err.message });
        } else {
          setError('root', { message: msg });
        }

      } else {

        setError('root', { message: msg });

      }

      toast.error(msg);

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col justify-center items-center p-6 sm:p-12 relative">

      <button
        onClick={() => navigate(ROUTES.LANDING)}
        className="absolute top-6 left-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

        <div className="flex flex-col items-center text-center mb-8">

          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <Lock className="h-8 w-8" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Admin Portal
          </h2>

          <div className="bg-red-50 text-red-700 text-xs font-semibold px-3 py-1 rounded-full border border-red-100">
            Restricted Access — Authorized Personnel Only
          </div>

        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <Input
            label="Email Address"
            type="email"
            placeholder="admin@school.edu"
            leftIcon={<Mail className="h-4 w-4" />}
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />

          {errors.root && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-700">
                {errors.root.message}
              </p>
            </div>
          )}

          <div className="pt-2">

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            >
              Sign In to Dashboard
            </Button>

          </div>

        </form>

      </div>

    </div>
  );
}

