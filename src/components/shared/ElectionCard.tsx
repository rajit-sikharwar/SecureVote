import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Calendar, GraduationCap } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Election } from '@/types';
import { getCourseInfo } from '@/constants/academic';
import { toDate } from '@/lib/dates';

interface ElectionCardProps {
  election: Election;
  hasVoted?: boolean;
  onClick?: () => void;
  isAdmin?: boolean;
}

export function ElectionCard({ election, hasVoted, onClick, isAdmin }: ElectionCardProps) {
  const now = new Date();
  const startTime = new Date(election.startTime);
  const endTime = new Date(election.endTime);

  const isActive = now >= startTime && now <= endTime;
  const hasEnded = now > endTime;
  const notStarted = now < startTime;

  const courseInfo = getCourseInfo(election.course);

  return (
    <motion.div whileHover={{ y: -6, rotateX: 1.6, rotateY: -1.6 }} transition={{ type: 'spring', stiffness: 240, damping: 18 }}>
      <Card hoverable className="p-4 border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.08)]" onClick={onClick}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex gap-2 items-center flex-wrap">
            {isActive && !hasVoted && (
              <Badge variant="success">● Active</Badge>
            )}
            {hasEnded && (
              <Badge variant="default">Ended</Badge>
            )}
            {notStarted && (
              <Badge variant="warning">Upcoming</Badge>
            )}

            {hasVoted && (
              <Badge variant="brand">✓ Voted</Badge>
            )}
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <GraduationCap className="h-3 w-3" />
              <span>{courseInfo?.label || election.course} Y{election.year} {election.section}</span>
            </div>
          )}
        </div>

        <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1 line-clamp-2">
          {election.title}
        </h3>

        <p className="text-gray-500 text-sm line-clamp-2 mb-4">
          {election.description}
        </p>

        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4" />
            <span>{courseInfo?.label || election.course} Y{election.year} {election.section}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{format(toDate(election.endTime) ?? new Date(), 'MMM d, yyyy')}</span>
          </div>
        </div>

        {!isAdmin && (
          <div className="w-full">
            {hasVoted || hasEnded ? (
              <Button variant="outline" fullWidth size="sm">
                View Details
              </Button>
            ) : isActive ? (
              <Button variant="primary" fullWidth size="sm" rightIcon={<span>→</span>}>
                Vote Now
              </Button>
            ) : notStarted ? (
              <Button variant="outline" fullWidth size="sm">
                Starts {format(startTime, 'MMM d')}
              </Button>
            ) : null}
          </div>
        )}
      </Card>
    </motion.div>
  );
}