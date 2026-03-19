import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { ArrowRight, Sparkles, UserPlus, LogIn } from 'lucide-react';
import { signInStudent } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';
import { OrbField } from '@/components/experience/OrbField';
import { TiltSurface } from '@/components/experience/TiltSurface';

const highlights = [
  'Supabase-backed authentication',
  'Course/Year/Section eligibility',
  'Secure student voting system',
];

interface LoginForm {
  email: string;
  password: string;
}

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  useEffect(() => {
    if (!user) return;

    navigate(user.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.STUDENT_HOME, {
      replace: true,
    });
  }, [navigate, user]);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);

    try {
      await signInStudent(data.email, data.password);
      toast.success('Welcome back!');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to sign in.';

      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#08111f] text-white">
      <OrbField />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_42%),linear-gradient(135deg,_rgba(17,24,39,0.25),_rgba(4,14,26,0.92))]" />

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col justify-center gap-14 px-6 py-10 lg:flex-row lg:items-center lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-2xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-slate-200 backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            College-level secure voting platform
          </div>

          <h1 className="max-w-xl text-5xl font-semibold leading-[1.02] text-white sm:text-6xl">
            SecureVote: Modern Student Election Platform
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            A comprehensive React + Vite voting platform with Supabase backend, academic-focused elections,
            and a beautiful motion-rich UI designed for college students.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Email Address
                </label>
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent backdrop-blur-xl"
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Password
                </label>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type="password"
                  placeholder="Enter your password"
                  className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent backdrop-blur-xl"
                />
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-cyan-300 px-6 text-base font-semibold text-slate-950 shadow-[0_20px_60px_rgba(45,212,191,0.2)] transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:opacity-70"
              >
                <LogIn className="h-5 w-5" />
                {loading ? 'Signing in...' : 'Sign In as Student'}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                to={ROUTES.STUDENT_REGISTER}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/6 px-6 text-sm font-semibold text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/10 max-w-md"
              >
                <UserPlus className="h-4 w-4" />
                New Student? Register Here
              </Link>

              <Link
                to={ROUTES.ADMIN_LOGIN}
                className="inline-flex items-center gap-2 text-sm font-medium text-cyan-200 transition hover:text-white"
              >
                Open admin portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        <TiltSurface className="w-full max-w-xl self-center [perspective:1400px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.55 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-[0_30px_120px_rgba(2,6,23,0.5)] backdrop-blur-2xl"
          >
            <div className="absolute inset-0 bg-[linear-gradient(145deg,_rgba(255,255,255,0.18),_rgba(255,255,255,0)_36%,_rgba(34,211,238,0.14)_72%,_rgba(255,255,255,0)_100%)]" />

            <div className="relative space-y-5">
              <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/45 p-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Academic System</p>
                  <h2 className="mt-2 text-2xl font-semibold">Student Elections</h2>
                </div>
                <div className="rounded-2xl bg-cyan-300/16 px-4 py-2 text-sm font-medium text-cyan-100">
                  Supabase
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-5">
                  <p className="text-sm text-slate-400">Smart Eligibility</p>
                  <p className="mt-2 text-3xl font-semibold">Course + Year</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Elections filtered by course, year, and section. Students vote only in eligible elections.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-5">
                  <p className="text-sm text-slate-400">Secure Voting</p>
                  <p className="mt-2 text-3xl font-semibold">One Vote Only</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Database-level constraints ensure each student votes once per election with full audit trail.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[linear-gradient(150deg,_rgba(14,165,233,0.22),_rgba(15,23,42,0.6))] p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-cyan-100/70">Experience</p>
                    <p className="mt-2 text-2xl font-semibold">3D Cards, Animations & More</p>
                  </div>
                  <div className="grid gap-2 text-right text-sm text-slate-100">
                    <span>React + Vite</span>
                    <span>Material UI</span>
                    <span>Framer Motion</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </TiltSurface>
      </div>
    </div>
  );
}
