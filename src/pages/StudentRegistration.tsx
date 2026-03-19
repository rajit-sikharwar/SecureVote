import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { registerStudent } from '@/services/auth.service';
import { COURSES, ACADEMIC_YEARS, SECTIONS, GENDERS, getAllowedYears, getAdmissionYears } from '@/constants/academic';
import { ROUTES } from '@/constants/routes';
import { getAppError } from '@/lib/errors';
import type { Course, RegistrationData } from '@/types';

// Validation schema with all student fields
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
  const [selectedCourse, setSelectedCourse] = useState<Course | ''>('');

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

  // Update allowed years when course changes
  const allowedYears = selectedCourse ? getAllowedYears(selectedCourse) : [1, 2, 3, 4];

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
            Your account has been created successfully. You can now sign in using your email and password.
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
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#24243E] py-8 px-4">
      <div className="w-full max-w-3xl mx-auto">
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

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student Registration
          </h1>

          <p className="text-gray-500 text-sm mb-8">
            Complete all fields below to register for SecureVote
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('fullName')}
                    placeholder="John Doe"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#302B63]/40 focus:border-[#302B63]"
                  />
                  {errors.fullName && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#302B63]/40 focus:border-[#302B63]"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#302B63]/40 focus:border-[#302B63]"
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('dateOfBirth')}
                    type="date"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#302B63]/40 focus:border-[#302B63]"
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('gender')}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#302B63]/40 focus:border-[#302B63]"
                  >
                    <option value="">Select Gender</option>
                    {GENDERS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                  {errors.gender && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.gender.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('address')}
                    placeholder="Your full address"
                    rows={2}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#302B63]/40 focus:border-[#302B63]"
                  />
                  {errors.address && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="Min. 6 characters"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#302B63]/40 focus:border-[#302B63]"
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="Re-enter password"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#302B63]/40 focus:border-[#302B63]"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* College Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                College Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    College Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('collegeName')}
                    placeholder="Your College Name"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#302B63]/40 focus:border-[#302B63]"
                  />
                  {errors.collegeName && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.collegeName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Enrollment Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('enrollmentNumber')}
                    placeholder="EN12345678"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#302B63]/40 focus:border-[#302B63]"
                  />
                  {errors.enrollmentNumber && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.enrollmentNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Roll Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('rollNumber')}
                    placeholder="ROLL001"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#302B63]/40 focus:border-[#302B63]"
                  />
                  {errors.rollNumber && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.rollNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Admission Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('admissionYear', { valueAsNumber: true })}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#302B63]/40 focus:border-[#302B63]"
                  >
                    {getAdmissionYears().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {errors.admissionYear && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.admissionYear.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                Academic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('course')}
                    onChange={(e) => {
                      register('course').onChange(e);
                      setSelectedCourse(e.target.value as Course);
                      // Reset year to 1 when course changes
                      setValue('year', 1);
                    }}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#302B63]/40 focus:border-[#302B63]"
                  >
                    <option value="">Select Course</option>
                    {COURSES.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.label}
                      </option>
                    ))}
                  </select>
                  {errors.course && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.course.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('year', { valueAsNumber: true })}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#302B63]/40 focus:border-[#302B63]"
                  >
                    {allowedYears.map((year) => {
                      const yearInfo = ACADEMIC_YEARS.find(y => y.value === year);
                      return (
                        <option key={year} value={year}>
                          {yearInfo?.label || `Year ${year}`}
                        </option>
                      );
                    })}
                  </select>
                  {errors.year && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.year.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('section')}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#302B63]/40 focus:border-[#302B63]"
                  >
                    <option value="">Select Section</option>
                    {SECTIONS.map((section) => (
                      <option key={section.value} value={section.value}>
                        {section.label}
                      </option>
                    ))}
                  </select>
                  {errors.section && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.section.message}</p>
                  )}
                </div>
              </div>
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
