import { Badge } from '../ui/Badge';
import type { ElectionStatus } from '@/types';

export function StatusBadge({ status }: { status: ElectionStatus }) {
  switch (status) {
    case 'active':
      return <Badge variant="success">● Active</Badge>;
    case 'closed':
      return <Badge variant="default">Closed</Badge>;
    case 'draft':
      return <Badge variant="warning">Draft</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}
