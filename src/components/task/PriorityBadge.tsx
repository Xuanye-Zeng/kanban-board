import { AlertCircle, ArrowUp, Minus, ArrowDown } from 'lucide-react';
import type { TaskPriority } from '../../types';
import { PRIORITY_CONFIG } from '../../lib/constants';

const icons = {
  urgent: AlertCircle,
  high: ArrowUp,
  medium: Minus,
  low: ArrowDown,
};

export function PriorityBadge({ priority, showLabel = false }: { priority: TaskPriority; showLabel?: boolean }) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = icons[priority];

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold ring-1 ring-inset"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        boxShadow: `inset 0 0 0 1px ${config.color}20`,
      }}
    >
      <Icon size={11} strokeWidth={2.5} />
      {showLabel && config.label}
    </span>
  );
}
