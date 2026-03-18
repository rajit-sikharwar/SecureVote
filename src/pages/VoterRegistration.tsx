import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { preRegisterVoter } from '@/services/auth.service';
import { CATEGORIES } from '@/constants/categories';
import { ROUTES } from '@/constants/routes';
import type { UserCategory } from '@/types';
import { getFirebaseError } from '@/lib/errors';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid Gmail / Google account email'),
  category: z.string().min(1, 'Please select your category'),
});

type Form = z.infer<typeof schema>;

export default function VoterRegistration() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    try {
      await preRegisterVoter(
        data.name,
        data.email,
        data.category as UserCategory
      );
      setDone(true);
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code: unknown }).code)
          : null;

      const message = code
        ? getFirebaseError(code)
        : err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.';

      toast.error(message);
    }
  };

  if (done) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#24243E] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-5">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Successful!
          </h2>

          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            Your account has been registered. You can now sign in using your
            Google account on the main page.
          </p>

          <button
            onClick={() => navigate(ROUTES.LANDING)}
            className="w-full h-13 bg-[#302B63] text-white rounded-2xl font-semibold py-3 hover:bg-[#24243E] transition-colors"
          >
            Go to Sign In →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#24243E] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="flex items-center gap-3 mb-6">
          <Link
            to={ROUTES.LANDING}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-white" />
            <span className="text-white font-bold text-lg">SecureVote</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-7">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Register as Voter
          </h1>

          <p className="text-gray-500 text-sm mb-7">
            Fill in your details below. After registering, use
            <strong> Continue with Google</strong> on the main page to sign in.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>

              <input
                {...register('name')}
                placeholder="Jane Doe"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#302B63]/40 focus:border-[#302B63]"
              />

              {errors.name && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Gmail Address
              </label>

              <input
                {...register('email')}
                type="email"
                placeholder="you@gmail.com"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#302B63]/40 focus:border-[#302B63]"
              />

              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Category
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {CATEGORIES.map((cat) => {
                  const { ref, ...rest } = register('category');

                  return (
                    <label key={cat.id} className="relative cursor-pointer">
                      <input
                        type="radio"
                        value={cat.id}
                        ref={ref}
                        {...rest}
                        className="peer sr-only"
                      />

                      <div className="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 border-gray-100 bg-white text-center transition-all peer-checked:border-[#302B63] peer-checked:bg-indigo-50 hover:border-gray-300">
                        <span className="text-2xl">{cat.emoji}</span>

                        <span className="text-xs font-semibold text-gray-700 peer-checked:text-[#302B63]">
                          {cat.label}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {errors.category && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#302B63] text-white rounded-2xl font-semibold hover:bg-[#24243E] transition-colors disabled:opacity-70"
            >
              {isSubmitting ? 'Registering…' : 'Register Account'}
            </button>

          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            Already registered?{' '}
            <Link
              to={ROUTES.LANDING}
              className="text-[#302B63] font-medium hover:underline"
            >
              Sign in here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
