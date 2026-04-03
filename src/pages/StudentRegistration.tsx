import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { GraduationCap, ArrowLeft, CheckCircle2, Eye, EyeOff, User, Mail, Phone, Calendar, MapPin, Building, Hash, BookOpen } from 'lucide-react';
import { registerStudent } from '@/services/auth.service';
import { COURSES, ACADEMIC_YEARS, SECTIONS, GENDERS, getAllowedYears, getAdmissionYears } from '@/constants/academic';
import { ROUTES } from '@/constants/routes';
import { getAppError } from '@/lib/errors';
import type { Course, RegistrationData } from '@/types';

// Validation schema
const schema = z.object({
  // Personal Information
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Please select your gender'),
  address: z.string().min(5, 'Address must be at least 5 characters'),

  // College Information
  collegeName: z.string().min(2, 'College name is required'),
  enrollmentNumber: z.string().min(3, 'Enrollment number is required'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  admissionYear: z.number().min(2000, 'Please select admission year'),

  // Academic Information
  course: z.string().min(1, 'Please select your course'),
  year: z.number().min(1).max(4, 'Invalid year'),
  section: z.string().min(1, 'Please select your section'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Form = z.infer<typeof schema>;

export default function StudentRegistration() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      admissionYear: new Date().getFullYear(),
      year: 1,
    },
  });

  const watchedCourse = watch('course');
  const allowedYears = watchedCourse ? getAllowedYears(watchedCourse as Course) : [1, 2, 3, 4];

  const onSubmit = async (data: Form) => {
    try {
      const registrationData: RegistrationData = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender as any,
        address: data.address,
        collegeName: data.collegeName,
        enrollmentNumber: data.enrollmentNumber,
        rollNumber: data.rollNumber,
        admissionYear: data.admissionYear,
        course: data.course as Course,
        year: data.year as any,
        section: data.section as any,
      };

      await registerStudent(registrationData, data.password);
      setDone(true);
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code: unknown }).code)
          : null;

      const message = code
        ? getAppError(code)
        : err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.';

      toast.error(message);
    }
  };

  if (done) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.15),_transparent_50%)]" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-500/20 rounded-full">
              <CheckCircle2 className="h-16 w-16 text-green-400" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3">
            Registration Successful!
          </h2>

          <p className="text-slate-300 mb-8 leading-relaxed">
            Your student account has been created successfully. You can now sign in and start voting in elections.
          </p>

          <button
            onClick={() => navigate(ROUTES.STUDENT_LOGIN)}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <span>Continue to Login</span>
            <GraduationCap className="h-5 w-5" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 py-12 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.15),_transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.1),_transparent_50%)]" />
      
      {/* Animated background orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to={ROUTES.LANDING}
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-10 shadow-2xl"
        >
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/20 mb-4">
              <GraduationCap className="h-10 w-10 text-indigo-300" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Student Registration
            </h1>
            <p className="text-slate-400">Create your SecureVote account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-400" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register('fullName')}
                    placeholder="John Doe"
                    className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-xl transition-all"
                  />
                  {errors.fullName && (
                    <p className="mt-2 text-xs text-red-400">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="you@college.edu"
                      className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-xl transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-xs text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-xl transition-all"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-2 text-xs text-red-400">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Date of Birth <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      {...register('dateOfBirth')}
                      type="date"
                      className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-xl transition-all"
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="mt-2 text-xs text-red-400">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Gender <span className="text-red-400">*</span>
                  </label>
                  <select
                    {...register('gender')}
                    className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-xl transition-all"
                  >
                    <option value="" className="bg-slate-800">Select Gender</option>
                    {GENDERS.map((g) => (
                      <option key={g.value} value={g.value} className="bg-slate-800">
                        {g.label}
                      </option>
                    ))}
                  </select>
                  {errors.gender && (
                    <p className="mt-2 text-xs text-red-400">{errors.gender.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <textarea
                      {...register('address')}
                      placeholder="Your full address"
                      rows={2}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-xl transition-all resize-none"
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-2 text-xs text-red-400">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      className="w-full h-12 px-4 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-xl transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-xs text-red-400">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      className="w-full h-12 px-4 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-xl transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-xs text-red-400">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* College Information */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Building className="h-5 w-5 text-indigo-400" />
                College Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    College Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register('collegeName')}
                    placeholder="Your College Name"
                    className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-xl transition-all"
                  />
                  {errors.collegeName && (
                    <p className="mt-2 text-xs text-red-400">{errors.collegeName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Enrollment Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      {...register('enrollmentNumber')}
                      placeholder="EN12345678"
                      className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-xl transition-all"
                    />
                  </div>
                  {errors.enrollmentNumber && (
                    <p className="mt-2 text-xs text-red-400">{errors.enrollmentNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Roll Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      {...register('rollNumber')}
                      placeholder="ROLL001"
                      className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-xl transition-all"
                    />
                  </div>
                  {errors.rollNumber && (
                    <p className="mt-2 text-xs text-red-400">{errors.rollNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Admission Year <span className="text-red-400">*</span>
                  </label>
                  <select
                    {...register('admissionYear', { valueAsNumber: true })}
                    className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-xl transition-all"
                  >
                    {getAdmissionYears().map((year) => (
                      <option key={year} value={year} className="bg-slate-800">
                        {year}
                      </option>
                    ))}
                  </select>
                  {errors.admissionYear && (
                    <p className="mt-2 text-xs text-red-400">{errors.admissionYear.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-400" />
                Academic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Course <span className="text-red-400">*</span>
                  </label>
                  <select
                    {...register('course')}
                    onChange={(e) => {
                      register('course').onChange(e);
                      setValue('year', 1);
                    }}
                    className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-xl transition-all"
                  >
                    <option value="" className="bg-slate-800">Select Course</option>
                    {COURSES.map((course) => (
                      <option key={course.id} value={course.id} className="bg-slate-800">
                        {course.label}
                      </option>
                    ))}
                  </select>
                  {errors.course && (
                    <p className="mt-2 text-xs text-red-400">{errors.course.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Academic Year <span className="text-red-400">*</span>
                  </label>
                  <select
                    {...register('year', { valueAsNumber: true })}
                    className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-xl transition-all"
                  >
                    {allowedYears.map((year) => {
                      const yearInfo = ACADEMIC_YEARS.find(y => y.value === year);
                      return (
                        <option key={year} value={year} className="bg-slate-800">
                          {yearInfo?.label || `Year ${year}`}
                        </option>
                      );
                    })}
                  </select>
                  {errors.year && (
                    <p className="mt-2 text-xs text-red-400">{errors.year.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Section <span className="text-red-400">*</span>
                  </label>
                  <select
                    {...register('section')}
                    className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-xl transition-all"
                  >
                    <option value="" className="bg-slate-800">Select Section</option>
                    {SECTIONS.map((section) => (
                      <option key={section.value} value={section.value} className="bg-slate-800">
                        {section.label}
                      </option>
                    ))}
                  </select>
                  {errors.section && (
                    <p className="mt-2 text-xs text-red-400">{errors.section.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-5 w-5" />
                    <span>Create Student Account</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link
              to={ROUTES.STUDENT_LOGIN}
              className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
