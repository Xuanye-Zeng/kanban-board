import { Calendar } from 'lucide-react';
import { isOverdue, isDueSoon, formatDueDate } from '../../utils/dates';

export function DueDateBadge({ date, status }: { date: string | null; status: string }) {
  if (!date) return null;

  const completed = status === 'done';
  const overdue = !completed && isOverdue(date);
  const dueSoon = !completed && isDueSoon(date);

  let colorClass = 'text-gray-400 bg-gray-50';
  if (overdue) colorClass = 'text-rose-600 bg-rose-50 ring-1 ring-rose-200';
  else if (dueSoon) colorClass = 'text-amber-600 bg-amber-50 ring-1 ring-amber-200';
  else if (completed) colorClass = 'text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200';

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold ${colorClass}`}>
      <Calendar size={10} strokeWidth={2.5} />
      {formatDueDate(date)}
    </span>
  );
}
