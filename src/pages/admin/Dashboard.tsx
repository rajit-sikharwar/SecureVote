import { useAdminData } from '@/hooks/useAdminData'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Vote, Users, UserCheck, BarChart3, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { useElections } from '@/hooks/useElections'
import { CATEGORY_MAP } from '@/constants/categories'
import type { UserCategory } from '@/types'
import type { LucideIcon } from 'lucide-react'
import { Timestamp } from 'firebase/firestore'

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  colorClass: string
  bgColorClass: string
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
  bgColorClass
}: StatCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-500">{title}</h3>

        <div className={`p-2 rounded-xl ${bgColorClass}`}>
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
      </div>

      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </Card>
  )
}

export default function AdminDashboard() {
  const { stats, recentLogs, loading: loadingStats } = useAdminData()
  const { elections, loading: loadingElections } = useElections()

  const activeElections = elections.filter(e => e.status === 'active')

  const formatLogTimestamp = (value: unknown): string => {
    return value instanceof Timestamp ? format(value.toDate(), 'PP p') : 'Date unavailable'
  }

  if (loadingStats || loadingElections) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Dashboard Overview
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <StatCard
            title="Total Elections"
            value={stats.totalElections}
            icon={Vote}
            colorClass="text-blue-600"
            bgColorClass="bg-blue-50"
          />

          <StatCard
            title="Total Candidates"
            value={stats.totalCandidates}
            icon={Users}
            colorClass="text-purple-600"
            bgColorClass="bg-purple-50"
          />

          <StatCard
            title="Registered Voters"
            value={stats.totalVoters}
            icon={UserCheck}
            colorClass="text-emerald-600"
            bgColorClass="bg-emerald-50"
          />

          <StatCard
            title="Total Votes Cast"
            value={stats.totalVotesCast}
            icon={BarChart3}
            colorClass="text-amber-600"
            bgColorClass="bg-amber-50"
          />

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Card className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900">Active Elections</h2>
          </div>

          <div className="space-y-4 flex-1">

            {activeElections.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No active elections.
              </p>
            ) : (
              activeElections.map(e => (
                <div
                  key={e.id}
                  className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between"
                >

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 leading-tight">
                      {e.title}
                    </h4>

                    <div className="flex gap-1">
                      {e.eligibleCategories.map(cat =>
                        <CategoryBadge key={cat} category={cat} />
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-brand-600">
                      {e.totalVotes}
                    </div>

                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Votes
                    </div>
                  </div>

                </div>
              ))
            )}

          </div>
        </Card>

        <Card className="p-6 flex flex-col h-full">

          <div className="flex items-center gap-3 mb-6">
            <Activity className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900">
              Recent Activity
            </h2>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[360px] pr-2">

            {recentLogs.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No recent activity.
              </p>
            ) : (
              recentLogs.map(log => (
                <div
                  key={log.id}
                  className="flex gap-4 items-start relative pb-4 last:pb-0"
                >

                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 z-10 text-xs shadow-sm border border-white">
                    {log.action.includes('vote') ? '🗳️' :
                     log.action.includes('register') ? '👤' :
                     log.action.includes('candidate') ? '👥' : '📝'}
                  </div>

                  <div className="absolute top-8 bottom-0 left-4 w-px bg-gray-100 -translate-x-1/2 last:hidden" />

                  <div className="flex-1 bg-white pt-1">

                    <p className="text-sm text-gray-900 capitalize-first flex items-center gap-2">

                      <span className="font-medium text-gray-700">
                        {log.action.replace('_', ' ')}
                      </span>

                      {typeof log.metadata.category === 'string' &&
                       log.metadata.category in CATEGORY_MAP && (
                        <CategoryBadge
                          category={log.metadata.category as UserCategory}
                        />
                      )}

                    </p>

                    <p className="text-xs text-gray-500 mt-1.5 flex items-center justify-between">

                      <span className="font-mono text-[10px] bg-gray-50 px-1.5 py-0.5 rounded text-gray-400">
                        UID: {log.performedBy.substring(0,6)}...
                      </span>

                      <span>
                        {formatLogTimestamp(log.timestamp)}
                      </span>

                    </p>

                  </div>

                </div>
              ))
            )}

          </div>

        </Card>

      </div>
    </div>
  )
}
