import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ShieldCheck, UserPlus } from 'lucide-react';
import {
  signInWithGoogle,
  hasGooglePending,
  clearGooglePending,
  completeGoogleLogin,
} from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const [checkingRedirect, setChecking] = useState(true);

  const navigate = useNavigate();
  const { setUser, user } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (user) {
          navigate(
            user.role === 'admin'
              ? ROUTES.ADMIN_DASHBOARD
              : ROUTES.USER_HOME,
            { replace: true }
          );
          return;
        }

        if (!hasGooglePending()) {
          if (!cancelled) setChecking(false);
          return;
        }

        clearGooglePending();
        const result = await completeGoogleLogin();

        if (cancelled) return;

        if (result === 'not_authenticated') {
          toast.error('Sign-in failed. Please try again.');
          setChecking(false);
          return;
        }

        if (result === 'not_registered') {
          toast.error(
            '⚠️ This Google account is not registered. Please register first.',
            { duration: 5000 }
          );
          setChecking(false);
          return;
        }

        const { appUser } = result;

        setUser(appUser);
        toast.success('Welcome back! 👋');

        navigate(
          appUser.role === 'admin'
            ? ROUTES.ADMIN_DASHBOARD
            : ROUTES.USER_HOME,
          { replace: true }
        );
      } catch (err: unknown) {
        console.error('Auth error:', err);

        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : 'Authentication failed.';

          toast.error(message);
          setChecking(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, navigate, setUser]);

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to start Google sign-in.';

      toast.error(message);
      setLoading(false);
    }
  };

  if (checkingRedirect) {
    return (
      <div className="min-h-[100dvh] w-full bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#24243E] flex items-center justify-center">
        <svg
          className="animate-spin h-8 w-8 text-white/50"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 
            0 0 5.373 0 12h4zm2 
            5.291A7.962 7.962 0 
            014 12H0c0 3.042 
            1.135 5.824 3 
            7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#24243E] flex flex-col items-center justify-center p-6 relative overflow-hidden">

      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />

      <div className="w-full max-w-[430px] flex flex-col items-center z-10 text-center">

        <div className="h-24 w-24 bg-white/10 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/20 shadow-2xl relative">
          <ShieldCheck className="h-12 w-12 text-white" />
          <div className="absolute inset-0 bg-white/20 rounded-3xl blur animate-pulse" />
        </div>

        <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
          SecureVote
        </h1>

        <p className="text-[#a5b4fc] text-lg mb-10 font-medium">
          Trusted digital voting for every organization
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-12 w-full max-w-[320px]">
          {['🔒 One Vote', '👥 Category Isolated', '⚡ Real-time'].map((t) => (
            <div
              key={t}
              className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              {t}
            </div>
          ))}
        </div>

        <div className="w-full space-y-4">

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-14 bg-white text-gray-900 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 hover:bg-gray-50 active:bg-gray-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-80 relative overflow-hidden group"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Redirecting…
              </span>
            ) : (
              <>
                <span className="z-10">Continue with Google</span>
              </>
            )}
          </button>

          <Link
            to={ROUTES.VOTER_REGISTER}
            className="w-full h-12 rounded-2xl border border-white/30 text-white/90 font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-all backdrop-blur-sm"
          >
            <UserPlus className="h-4 w-4"/>
            Register as Voter
          </Link>

          <Link
            to={ROUTES.ADMIN_LOGIN}
            className="block text-[#a5b4fc] text-sm font-medium hover:text-white transition-colors"
          >
            Admin Portal →
          </Link>

        </div>
      </div>

      <div className="absolute bottom-6 text-white/30 text-xs font-mono tracking-widest">
        v1.0.0
      </div>
    </div>
  );
}
