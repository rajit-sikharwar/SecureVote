import { useState, useEffect } from 'react';
import { useElections } from '@/hooks/useElections';
import { getElectionResults, getTotalVotesForElection } from '@/services/vote.service';
import { calculatePercentage } from '@/constants/academic';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { Trophy, TrendingUp, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface CandidateResult {
  candidateId: string;
  candidateName: string;
  photoURL?: string;
  voteCount: number;
}

export default function AdminResults() {
  const { elections, loading: loadingElections } = useElections();
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(false);

  const electionOptions = elections.map(e => ({
    value: e.id,
    label: e.title
  }));

  useEffect(() => {
    if (!selectedElectionId) {
      setResults([]);
      setTotalVotes(0);
      return;
    }

    const loadResults = async () => {
      setLoading(true);
      try {
        const [resultsData, total] = await Promise.all([
          getElectionResults(selectedElectionId),
          getTotalVotesForElection(selectedElectionId)
        ]);
        setResults(resultsData);
        setTotalVotes(total);
      } catch (error) {
        console.error('Failed to load results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [selectedElectionId]);

  const sortedResults = [...results].sort((a, b) => b.voteCount - a.voteCount);
  const winner = sortedResults[0];

  // Chart data
  const barChartData = sortedResults.map(r => ({
    name: r.candidateName.split(' ')[0], // First name only for chart
    votes: r.voteCount,
  }));

  const pieChartData = sortedResults.map(r => ({
    name: r.candidateName,
    value: r.voteCount,
  }));

  const COLORS = ['#4f46e5', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];

  if (loadingElections) {
    return (
      <div className="space-y-4">
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-7 w-7 text-indigo-600" />
          Election Results & Analytics
        </h1>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <Select
          label="Select Election"
          value={selectedElectionId}
          onChange={(e) => setSelectedElectionId(e.target.value)}
          options={electionOptions}
        />
      </div>

      {!selectedElectionId ? (
        <EmptyState
          title="Select an Election"
          description="Please select an election from the dropdown above to view detailed results and analytics."
        />
      ) : loading ? (
        <div className="space-y-4">
          <Skeleton variant="card" className="h-48" />
          <Skeleton variant="card" className="h-96" />
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          title="No Votes Yet"
          description="No votes have been cast in this election yet."
          icon={<Users className="h-12 w-12 text-gray-400" />}
        />
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Total Votes</p>
                  <p className="text-4xl font-bold mt-1">{totalVotes}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Leading Candidate</p>
                  <p className="text-2xl font-bold mt-1 truncate">{winner?.candidateName || 'N/A'}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Trophy className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Candidates</p>
                  <p className="text-4xl font-bold mt-1">{results.length}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Rankings */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" />
              Candidate Rankings
            </h2>

            <div className="space-y-4">
              {sortedResults.map((candidate, index) => {
                const isWinner = index === 0 && totalVotes > 0;
                const percent = calculatePercentage(candidate.voteCount, totalVotes);

                return (
                  <div
                    key={candidate.candidateId}
                    className={`p-5 rounded-xl border-2 transition-all ${
                      isWinner
                        ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-sm'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex gap-4 items-center">
                      <div className={`font-mono text-2xl font-bold ${
                        isWinner ? 'text-emerald-600' : 'text-gray-400'
                      }`}>
                        #{index + 1}
                      </div>

                      <Avatar
                        src={candidate.photoURL}
                        fallback={candidate.candidateName}
                        size="md"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-lg leading-tight flex items-center gap-2">
                          {candidate.candidateName}
                          {isWinner && <Trophy className="h-5 w-5 text-amber-500 fill-amber-500" />}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {candidate.voteCount} votes ({percent.toFixed(1)}%)
                        </p>
                      </div>

                      <div className="text-right">
                        <div className={`text-3xl font-black ${
                          isWinner ? 'text-emerald-600' : 'text-gray-900'
                        }`}>
                          {candidate.voteCount}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 ml-20">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isWinner ? 'bg-emerald-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Vote Distribution (Bar Chart)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="votes" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Vote Share (Pie Chart)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name?.split(' ')[0] || 'Unknown'} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
