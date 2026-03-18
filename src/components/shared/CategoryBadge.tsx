import { CATEGORY_MAP } from '@/constants/categories';
import { Badge } from '../ui/Badge';
import type { UserCategory } from '@/types';

export function CategoryBadge({ category }: { category: UserCategory }) {
  const meta = CATEGORY_MAP[category];
  if (!meta) return <Badge>{category}</Badge>;

  return (
    <span 
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-transparent shadow-sm"
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      <span className="mr-1">{meta.emoji}</span>
      {meta.label}
    </span>
  );
}
