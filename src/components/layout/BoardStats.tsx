import { useBoard } from '../../contexts/BoardContext';
import { isOverdue } from '../../utils/dates';
import { CheckCircle2, Clock, AlertTriangle, Hash } from 'lucide-react';

export function BoardStats() {
  const { tasks } = useBoard();

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const overdue = tasks.filter(t => t.status !== 'done' && isOverdue(t.due_date)).length;

  const stats = [
    { label: 'Total', value: total, icon: Hash, color: 'text-gray-500' },
    { label: 'Active', value: inProgress, icon: Clock, color: 'text-blue-500' },
    { label: 'Done', value: completed, icon: CheckCircle2, color: 'text-emerald-500' },
    ...(overdue > 0 ? [{ label: 'Overdue', value: overdue, icon: AlertTriangle, color: 'text-red-500' }] : []),
  ];

  return (
    <div className="flex items-center gap-4">
      {stats.map(s => (
        <div key={s.label} className="flex items-center gap-1.5">
          <s.icon size={13} className={s.color} />
          <span className="text-xs font-bold text-gray-700 tabular-nums">{s.value}</span>
          <span className="text-[11px] text-gray-400 font-medium">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
