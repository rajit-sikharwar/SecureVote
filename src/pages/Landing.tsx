import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ArrowRight, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { signInWithGoogle } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';
import { OrbField } from '@/components/experience/OrbField';
import { TiltSurface } from '@/components/experience/TiltSurface';

const highlights = [
  'Supabase-backed authentication',
  'Category-safe ballot access',
  'Receipt-based vote confirmation',
];

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    navigate(user.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.USER_HOME, {
      replace: true,
    });
  }, [navigate, user]);

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      await signInWithGoogle();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to start Google sign-in.';

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
            Trusted digital voting for schools, societies, and teams
          </div>

          <h1 className="max-w-xl text-5xl font-semibold leading-[1.02] text-white sm:text-6xl">
            SecureVote with a modern, guided, 3D-style interface.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            A clean React + Vite voting workspace with Supabase auth, structured election flows,
            and a motion-rich UI that stays easy to understand and maintain.
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

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-cyan-300 px-6 text-base font-semibold text-slate-950 shadow-[0_20px_60px_rgba(45,212,191,0.2)] transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:opacity-70"
            >
              <ShieldCheck className="h-5 w-5" />
              {loading ? 'Redirecting to Google...' : 'Continue with Google'}
            </button>

            <Link
              to={ROUTES.VOTER_REGISTER}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/14 bg-white/6 px-6 text-base font-semibold text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              <UserPlus className="h-5 w-5" />
              Register as Voter
            </Link>
          </div>

          <Link
            to={ROUTES.ADMIN_LOGIN}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-200 transition hover:text-white"
          >
            Open the admin portal
            <ArrowRight className="h-4 w-4" />
          </Link>
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
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Live Control</p>
                  <h2 className="mt-2 text-2xl font-semibold">Election command deck</h2>
                </div>
                <div className="rounded-2xl bg-cyan-300/16 px-4 py-2 text-sm font-medium text-cyan-100">
                  Supabase
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-5">
                  <p className="text-sm text-slate-400">Protected flows</p>
                  <p className="mt-2 text-3xl font-semibold">Auth + roles</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Separate admin and voter journeys with session restoration and clean route guards.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-5">
                  <p className="text-sm text-slate-400">Vote integrity</p>
                  <p className="mt-2 text-3xl font-semibold">Atomic receipt flow</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Secure RPC voting keeps ballots singular while incrementing candidate and election totals.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[linear-gradient(150deg,_rgba(14,165,233,0.22),_rgba(15,23,42,0.6))] p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-cyan-100/70">Experience</p>
                    <p className="mt-2 text-2xl font-semibold">Animated cards, parallax glow, guided flows</p>
                  </div>
                  <div className="grid gap-2 text-right text-sm text-slate-100">
                    <span>React + Vite</span>
                    <span>Tailwind CSS</span>
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
