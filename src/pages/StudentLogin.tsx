import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { GraduationCap, ArrowLeft, LogIn, Eye, EyeOff } from 'lucide-react';
import { signInStudent } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants/routes';

interface LoginForm {
  email: string;
  password: string;
}

export default function StudentLogin() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);

    try {
      await signInStudent(data.email, data.password);
      toast.success('Welcome back!');

      // Check user state after login and redirect
      setTimeout(() => {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          navigate(currentUser.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.STUDENT_HOME, {
            replace: true,
          });
        }
      }, 100);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in.';
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.15),_transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.1),_transparent_50%)]" />
      
      {/* Animated background orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

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
            <div className="inline-flex p-4 rounded-2xl bg-indigo-500/20 mb-4">
              <GraduationCap className="h-10 w-10 text-indigo-300" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Student Login</h1>
            <p className="text-slate-400">Sign in to access your voting portal</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email Address
              </label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                placeholder="you@college.edu"
                className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-xl transition-all"
              />
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
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-xl transition-all"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-slate-400">Don't have an account?</span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to={ROUTES.STUDENT_REGISTER}
            className="block w-full h-12 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <GraduationCap className="h-5 w-5" />
            <span>Create Student Account</span>
          </Link>
        </motion.div>

        {/* Help Text */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Having trouble? Contact your system administrator
        </p>
      </div>
    </div>
  );
}
