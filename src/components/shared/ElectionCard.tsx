import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Users, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Election } from '@/types';
import { CATEGORIES } from '@/constants/categories';
import { toDate } from '@/lib/dates';

interface ElectionCardProps {
  election: Election;
  hasVoted?: boolean;
  onClick?: () => void;
  isAdmin?: boolean;
}

export function ElectionCard({ election, hasVoted, onClick, isAdmin }: ElectionCardProps) {
  const isActive = election.status === 'active';
  const isClosed = election.status === 'closed';
  const endDate = toDate(election.endDate);

  return (
    <motion.div whileHover={{ y: -6, rotateX: 1.6, rotateY: -1.6 }} transition={{ type: 'spring', stiffness: 240, damping: 18 }}>
    <Card hoverable className="p-4 border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.08)]" onClick={onClick}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex gap-2 items-center flex-wrap">
          {isActive ? (
            <Badge variant="success">● Active</Badge>
          ) : isClosed ? (
            <Badge variant="default">Closed</Badge>
          ) : (
            <Badge variant="warning">Draft</Badge>
          )}
          
          {hasVoted && (
            <Badge variant="brand">✓ Voted</Badge>
          )}
        </div>
        
        {isAdmin && (
          <div className="flex gap-1">
            {election.eligibleCategories.map(cat => {
              const c = CATEGORIES.find(x => x.id === cat);
              return c ? (
                <span key={cat} title={c.label} className="text-sm">{c.emoji}</span>
              ) : null;
            })}
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
          <Users className="h-4 w-4" />
          <span>{election.totalVotes} votes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          <span>{endDate ? format(endDate, 'MMM d, yyyy') : 'Date unavailable'}</span>
        </div>
      </div>

      {!isAdmin && (
        <div className="w-full">
          {hasVoted || isClosed ? (
            <Button variant="outline" fullWidth size="sm">
              View Results
            </Button>
          ) : isActive ? (
            <Button variant="primary" fullWidth size="sm" rightIcon={<span>→</span>}>
              Vote Now
            </Button>
          ) : null}
        </div>
      )}
    </Card>
    </motion.div>
  );
}
