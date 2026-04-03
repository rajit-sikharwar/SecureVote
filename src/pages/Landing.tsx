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
          <div className="mb-8 flex justify-center">
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
              <Vote className="h-8 w-8 text-cyan-300" />
              <h1 className="text-3xl font-bold text-white">SecureVote</h1>
            </div>
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto"
          >
            Modern Student Election Platform for College Voting
          </motion.p>

          {/* Login Options */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8"
          >
            {/* Student Login Card */}
            <button
              onClick={() => navigate(ROUTES.STUDENT_LOGIN)}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_rgba(99,102,241,0.4)] border border-indigo-400/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="mb-4 inline-flex p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">
                  Login as Student
                </h2>
                
                <p className="text-indigo-100 text-sm leading-relaxed">
                  Access your student portal to participate in elections, view results, and manage your voting history.
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-cyan-300">
                  <span>Continue to Student Portal</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Admin Login Card */}
            <button
              onClick={() => navigate(ROUTES.ADMIN_LOGIN)}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-700 to-slate-800 p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_rgba(100,116,139,0.4)] border border-slate-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="mb-4 inline-flex p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">
                  Login as Admin
                </h2>
                
                <p className="text-slate-200 text-sm leading-relaxed">
                  Access the admin dashboard to create elections, manage candidates, view analytics, and oversee the voting process.
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-cyan-300">
                  <span>Continue to Admin Portal</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="max-w-md mx-auto"
          >
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <UserPlus className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold">New Student?</p>
                    <p className="text-slate-400 text-sm">Create your account to get started</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(ROUTES.STUDENT_REGISTER)}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-all hover:scale-105 whitespace-nowrap"
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
            className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-slate-400"
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
