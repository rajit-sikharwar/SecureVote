import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Shield, Mail, Eye, EyeOff, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { signInAdmin } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';
import { getAppError } from '@/lib/errors';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      toast.success('Welcome back, Admin!');
      navigate(ROUTES.ADMIN_DASHBOARD);
    } catch (err: unknown) {
      let msg = 'Login failed';

      if (err instanceof Error) {
        msg = getAppError(
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(100,116,139,0.15),_transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(71,85,105,0.1),_transparent_50%)]" />
      
      {/* Animated background orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-slate-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Security badge */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-red-500/10 backdrop-blur-xl border border-red-400/30">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-red-400" />
          <span className="text-sm font-semibold text-red-300">Restricted Access</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Back Button */}
        <Link
          to={ROUTES.LANDING}
          className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-2xl bg-slate-500/20 mb-4">
              <Shield className="h-10 w-10 text-slate-300" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-slate-400">Authorized Personnel Only</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@college.edu"
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent backdrop-blur-xl transition-all"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter admin password"
                  className="w-full h-12 pl-12 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent backdrop-blur-xl transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Error Message */}
            {errors.root && (
              <div className="rounded-xl bg-red-500/10 border border-red-400/30 p-4">
                <p className="text-sm text-red-300">{errors.root.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-semibold shadow-lg shadow-slate-500/30 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-400/30">
            <p className="text-xs text-amber-300 text-center leading-relaxed">
              🔒 This is a restricted area. All access attempts are logged and monitored.
            </p>
          </div>
        </motion.div>

        {/* Help Text */}
        <p className="text-center text-sm text-slate-400 mt-6">
          System Administrator Access Only
        </p>
      </div>
    </div>
  );
}

