import { Badge } from '../ui/Badge';
import type { ElectionStatus } from '@/types';

export function StatusBadge({ status }: { status: ElectionStatus }) {
  switch (status) {
    case 'active':
      return <Badge variant="success">● Active</Badge>;
    case 'completed':
      return <Badge variant="default">Completed</Badge>;
    case 'upcoming':
      return <Badge variant="warning">Upcoming</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}
