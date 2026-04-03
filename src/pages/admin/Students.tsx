import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { toDate } from '@/lib/dates';
import { listUsers } from '@/services/user.service';
import { getCourseInfo } from '@/constants/academic';
import type { AppUser } from '@/types';

export default function AdminStudents() {
  const [students, setStudents] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const formatRegisteredAt = (value: unknown): string => {
    const date = typeof value === 'string' ? toDate(value) : null;
    return date ? format(date, 'MMM d, yyyy') : 'Unknown';
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await listUsers(1000);
        setStudents(data.filter(u => u.role === 'student'));
      } catch (err: unknown) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s =>
    s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollmentNumber?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton variant="text" className="w-32 h-8" />
          <Skeleton variant="text" className="w-48 h-10" />
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <Skeleton variant="text" className="w-1/3 h-6" />
          </div>
          <div className="p-4 border-b border-gray-100">
            <Skeleton variant="text" className="w-1/3 h-6" />
          </div>
          <div className="p-4">
            <Skeleton variant="text" className="w-1/3 h-6" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-indigo-600" />
            Students Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {students.length} registered student{students.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by name, email, or enrollment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium tracking-wide">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Student Profile</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Enrollment No.</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Course Details</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Registered</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 sm:px-6 py-6 sm:py-8 text-center text-gray-500">
                      No students found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const courseInfo = getCourseInfo(student.course);

                    return (
                      <tr key={student.uid} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar
                              src={student.photoURL}
                              fallback={student.fullName || 'S'}
                              size="sm"
                            />

                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-gray-900 truncate">
                                {student.fullName || 'Anonymous'}
                              </div>
                              <div className="text-gray-500 text-xs truncate">
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="font-mono text-xs sm:text-sm text-gray-900 font-medium">
                            {student.enrollmentNumber}
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 whitespace-nowrap">
                                {courseInfo?.label || student.course}
                              </span>
                              <span className="text-gray-400 hidden sm:inline">•</span>
                              <span className="text-xs text-gray-600 whitespace-nowrap">
                                Year {student.year}
                              </span>
                              <span className="text-gray-400 hidden sm:inline">•</span>
                              <span className="text-xs text-gray-600 whitespace-nowrap">
                                Section {student.section}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                          {formatRegisteredAt(student.createdAt)}
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          {student.isActive ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs sm:text-sm">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              <span className="hidden sm:inline">Active</span>
                              <span className="sm:hidden">✓</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-gray-400 font-medium text-xs sm:text-sm">
                              <span className="h-2 w-2 rounded-full bg-gray-300" />
                              <span className="hidden sm:inline">Inactive</span>
                              <span className="sm:hidden">−</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
