import { formatDistanceToNow, isPast, isToday, isTomorrow, addDays, isBefore } from 'date-fns';

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr + 'T23:59:59');
  return isPast(date) && !isToday(date);
}

export function isDueSoon(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const threeDaysFromNow = addDays(new Date(), 3);
  return !isOverdue(dateStr) && isBefore(date, threeDaysFromNow);
}

export function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}
