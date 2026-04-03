import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, GraduationCap, UserPlus, Vote } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.15),_transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.1),_transparent_50%)]" />
      
      {/* Animated background orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Logo/Brand */}
          <div className="mb-6 sm:mb-8 flex justify-center">
            <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
              <Vote className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-300" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">SecureVote</h1>
            </div>
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-base sm:text-lg lg:text-xl text-slate-300 mb-8 sm:mb-12 max-w-2xl mx-auto px-4"
          >
            Modern Student Election Platform for College Voting
          </motion.p>

          {/* Login Options */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto mb-6 sm:mb-8"
          >
            {/* Student Login Card */}
            <button
              onClick={() => navigate(ROUTES.STUDENT_LOGIN)}
              className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 sm:p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_rgba(99,102,241,0.4)] border border-indigo-400/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="mb-3 sm:mb-4 inline-flex p-2.5 sm:p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Login as Student
                </h2>
                
                <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed">
                  Access your student portal to participate in elections, view results, and manage your voting history.
                </p>

                <div className="mt-4 sm:mt-6 flex items-center gap-2 text-xs sm:text-sm font-semibold text-cyan-300">
                  <span>Continue to Student Portal</span>
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Admin Login Card */}
            <button
              onClick={() => navigate(ROUTES.ADMIN_LOGIN)}
              className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-700 to-slate-800 p-6 sm:p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_rgba(100,116,139,0.4)] border border-slate-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="mb-3 sm:mb-4 inline-flex p-2.5 sm:p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Login as Admin
                </h2>
                
                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                  Access the admin dashboard to create elections, manage candidates, view analytics, and oversee the voting process.
                </p>

                <div className="mt-4 sm:mt-6 flex items-center gap-2 text-xs sm:text-sm font-semibold text-cyan-300">
                  <span>Continue to Admin Portal</span>
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </motion.div>

          {/* Signup Option */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="max-w-md mx-auto px-4"
          >
            <div className="rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 sm:gap-4 flex-col sm:flex-row">
                <div className="flex items-center gap-2 sm:gap-3 text-center sm:text-left">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-cyan-500/20">
                    <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-300" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm sm:text-base text-white font-semibold">New Student?</p>
                    <p className="text-slate-400 text-xs sm:text-sm">Create your account to get started</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(ROUTES.STUDENT_REGISTER)}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm sm:text-base transition-all hover:scale-105 whitespace-nowrap w-full sm:w-auto"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-400 px-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>Secure Authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Course-Based Eligibility</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <span>One Vote Per Election</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
