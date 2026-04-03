import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Vote, Users, Calendar, GraduationCap, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { useElections } from '@/hooks/useElections';
import { listAllCandidates } from '@/services/candidate.service';
import { listUsers } from '@/services/user.service';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  colorClass: string;
  bgColorClass: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
  bgColorClass
}: StatCardProps) => {
  return (
    <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-medium text-gray-500 text-xs sm:text-sm">{title}</h3>

        <div className={`p-2 sm:p-3 rounded-xl ${bgColorClass}`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${colorClass}`} />
        </div>
      </div>

      <div className="text-3xl sm:text-4xl font-bold text-gray-900">{value}</div>
    </Card>
  );
};

export default function AdminDashboard() {
  const { elections, loading: loadingElections } = useElections();
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [users, candidates] = await Promise.all([
          listUsers(10000),
          listAllCandidates()
        ]);

        setTotalStudents(users.filter(u => u.role === 'student').length);
        setTotalCandidates(candidates.length);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const now = new Date();
  const activeElections = elections.filter(e => {
    const start = new Date(e.startTime);
    const end = new Date(e.endTime);
    return now >= start && now <= end;
  });

  const upcomingElections = elections.filter(e => {
    const start = new Date(e.startTime);
    return now < start;
  });

  if (loading || loadingElections) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center gap-2 sm:gap-3">
        <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Dashboard Overview
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Elections"
          value={elections.length}
          icon={Calendar}
          colorClass="text-indigo-600"
          bgColorClass="bg-indigo-100"
        />

        <StatCard
          title="Active Elections"
          value={activeElections.length}
          icon={Vote}
          colorClass="text-green-600"
          bgColorClass="bg-green-100"
        />

        <StatCard
          title="Registered Students"
          value={totalStudents}
          icon={GraduationCap}
          colorClass="text-purple-600"
          bgColorClass="bg-purple-100"
        />

        <StatCard
          title="Candidate Profiles"
          value={totalCandidates}
          icon={Users}
          colorClass="text-amber-600"
          bgColorClass="bg-amber-100"
        />
      </div>

      {/* Interactive Election Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Election Status Distribution - Bar Chart */}
        <Card className="p-4 sm:p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
            </div>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
              Election Status Overview
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
            <BarChart
              data={[
                { name: 'Active', count: activeElections.length, fill: '#10b981' },
                { name: 'Upcoming', count: upcomingElections.length, fill: '#3b82f6' },
                { name: 'Completed', count: elections.length - activeElections.length - upcomingElections.length, fill: '#6366f1' },
              ]}
              margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: 500 }} tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                }}
                cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
              <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Election Distribution - Pie Chart */}
        <Card className="p-4 sm:p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
              <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
              Election Distribution
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
            <RechartsPieChart>
              <Pie
                data={[
                  { name: 'Active', value: activeElections.length, fill: '#10b981' },
                  { name: 'Upcoming', value: upcomingElections.length, fill: '#3b82f6' },
                  { name: 'Completed', value: Math.max(0, elections.length - activeElections.length - upcomingElections.length), fill: '#6366f1' },
                ].filter(item => item.value > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                innerRadius={0}
                dataKey="value"
              >
                {[
                  { name: 'Active', value: activeElections.length, fill: '#10b981' },
                  { name: 'Upcoming', value: upcomingElections.length, fill: '#3b82f6' },
                  { name: 'Completed', value: Math.max(0, elections.length - activeElections.length - upcomingElections.length), fill: '#6366f1' },
                ].filter(item => item.value > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Vote className="h-6 w-6 text-green-600" />
            Active Elections
          </h2>

          {activeElections.length === 0 ? (
            <p className="text-gray-500 text-sm">No active elections at the moment</p>
          ) : (
            <div className="space-y-3">
              {activeElections.map(election => (
                <div key={election.id} className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-1">{election.title}</h3>
                  <p className="text-xs text-gray-600">
                    {election.course} Year {election.year} Section {election.section}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            Upcoming Elections
          </h2>

          {upcomingElections.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming elections scheduled</p>
          ) : (
            <div className="space-y-3">
              {upcomingElections.slice(0, 3).map(election => (
                <div key={election.id} className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-1">{election.title}</h3>
                  <p className="text-xs text-gray-600">
                    {election.course} Year {election.year} Section {election.section}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Welcome Message */}
      <Card className="p-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome to SecureVote Admin
        </h2>
        <p className="text-indigo-100">
          Manage your college's voting system with ease. Create elections, add candidates, and monitor results in real-time.
        </p>
      </Card>
    </div>
  );
}
