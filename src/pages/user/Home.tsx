import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Vote, Calendar, Clock, BookOpen, Users, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { listElections } from '@/services/election.service';
import { hasVoted } from '@/services/vote.service';
import { ROUTES } from '@/constants/routes';
import { ElectionCard } from '@/components/shared/ElectionCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { getCourseInfo } from '@/constants/academic';
import type { Election } from '@/types';

export default function StudentHome() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteStatuses, setVoteStatuses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user || user.role !== 'student') return;

    const loadElections = async () => {
      try {
        // Get all elections for student's course/year/section (not just active)
        const data = await listElections({
          course: user.course,
          year: user.year,
          section: user.section,
        });
        setElections(data);

        // Check vote status for each election
        const statuses: Record<string, boolean> = {};
        await Promise.all(
          data.map(async (e) => {
            statuses[e.id] = await hasVoted(user.uid, e.id);
          })
        );
        setVoteStatuses(statuses);
      } catch (error) {
        console.error('Failed to load elections:', error);
      } finally {
        setLoading(false);
      }
    };

    loadElections();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return null;
  }

  const courseInfo = getCourseInfo(user.course);
  const now = new Date();

  // Filter elections by status
  const activeElections = elections.filter(e => {
    const start = new Date(e.startTime);
    const end = new Date(e.endTime);
    return now >= start && now <= end;
  });

  const upcomingElections = elections.filter(e => {
    const start = new Date(e.startTime);
    return now < start;
  });

  const pastElections = elections.filter(e => {
    const end = new Date(e.endTime);
    return now > end;
  });

  const votedCount = Object.values(voteStatuses).filter(Boolean).length;
  const totalParticipationRate = elections.length > 0 ? ((votedCount / elections.length) * 100).toFixed(0) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl p-6 lg:p-8 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome, {user.fullName}!</h1>
              <p className="text-indigo-100 text-base lg:text-lg">
                {courseInfo?.label || user.course} • Year {user.year} • Section {user.section}
              </p>
              <p className="text-indigo-200 text-sm mt-1">
                Enrollment: {user.enrollmentNumber}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white/10 px-3 sm:px-4 py-3 rounded-xl backdrop-blur-sm">
              <Vote className="h-4 w-4 sm:h-5 sm:w-5" />
              <div className="text-center sm:text-left">
                <div className="text-lg sm:text-xl font-bold">{votedCount}</div>
                <div className="text-indigo-200 text-[10px] sm:text-xs whitespace-nowrap">Votes Cast</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white/10 px-3 sm:px-4 py-3 rounded-xl backdrop-blur-sm">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              <div className="text-center sm:text-left">
                <div className="text-lg sm:text-xl font-bold">{activeElections.length}</div>
                <div className="text-indigo-200 text-[10px] sm:text-xs whitespace-nowrap">Active Now</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white/10 px-3 sm:px-4 py-3 rounded-xl backdrop-blur-sm">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              <div className="text-center sm:text-left">
                <div className="text-lg sm:text-xl font-bold">{totalParticipationRate}%</div>
                <div className="text-indigo-200 text-[10px] sm:text-xs whitespace-nowrap">Participation</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Elections */}
      {activeElections.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-green-100 rounded-xl">
                <Vote className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Active Elections</h2>
                <p className="text-gray-500 text-sm sm:text-base">Vote now in these ongoing elections</p>
              </div>
            </div>
            {activeElections.length > 4 && (
              <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm self-start sm:self-auto">
                View All ({activeElections.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {activeElections.slice(0, 6).map((election) => (
              <ElectionCard
                key={election.id}
                election={election}
                hasVoted={voteStatuses[election.id]}
                onClick={() => navigate(ROUTES.ELECTION_DETAIL.replace(':id', election.id))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Elections */}
      {upcomingElections.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Elections</h2>
                <p className="text-gray-500">Elections starting soon</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {upcomingElections.slice(0, 4).map((election) => (
              <ElectionCard
                key={election.id}
                election={election}
                hasVoted={voteStatuses[election.id]}
                onClick={() => navigate(ROUTES.ELECTION_DETAIL.replace(':id', election.id))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity & Past Elections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Past Elections - Only show if there are past elections */}
        {pastElections.length > 0 && (
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <BookOpen className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Recent Elections</h2>
                  <p className="text-gray-500">View results from completed elections</p>
                </div>
              </div>
              {pastElections.length > 4 && (
                <button
                  onClick={() => navigate(ROUTES.MY_VOTES)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  View all past elections →
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pastElections.slice(0, 4).map((election) => (
                <ElectionCard
                  key={election.id}
                  election={election}
                  hasVoted={voteStatuses[election.id]}
                  onClick={() => navigate(ROUTES.ELECTION_DETAIL.replace(':id', election.id))}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sidebar - Academic Info & Quick Actions */}
        <div className={`space-y-6 ${pastElections.length === 0 ? 'xl:col-span-3' : ''}`}>
          <div className={`grid ${pastElections.length === 0 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'} gap-6`}>
            {/* Academic Info Card */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Academic Profile</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Course:</span>
                  <span className="font-medium">{courseInfo?.fullName || user.course}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Year:</span>
                  <span className="font-medium">Year {user.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Section:</span>
                  <span className="font-medium">Section {user.section}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">College:</span>
                  <span className="font-medium">{user.collegeName}</span>
                </div>
              </div>
            </Card>

            {/* Voting Stats Card */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Voting Stats</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Participation Rate</span>
                    <span className="font-medium">{totalParticipationRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${totalParticipationRate}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{votedCount}</div>
                    <div className="text-xs text-gray-500">Votes Cast</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{elections.length - votedCount}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(ROUTES.MY_VOTES)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left"
                >
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Vote className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">My Voting History</div>
                    <div className="text-xs text-gray-500">View all your past votes</div>
                  </div>
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
                >
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Refresh Elections</div>
                    <div className="text-xs text-gray-500">Check for new elections</div>
                  </div>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {elections.length === 0 && (
        <div className="text-center py-12">
          <EmptyState
            title="No Elections Yet"
            description={`No elections have been created for ${courseInfo?.label || user.course} Year ${user.year} Section ${user.section} yet. Check back later for upcoming elections.`}
            icon={<Vote className="h-16 w-16 text-gray-400" />}
          />

          {/* Helpful Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
            <Card className="p-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900">How Voting Works</h3>
              </div>
              <p className="text-sm text-gray-600">
                Elections are created specifically for your course, year, and section.
                You can only vote in elections you're eligible for, and each vote is secure and anonymous.
              </p>
            </Card>

            <Card className="p-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Stay Updated</h3>
              </div>
              <p className="text-sm text-gray-600">
                Elections will be announced when created by administrators.
                Check back regularly or refresh to see new elections for your class.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}