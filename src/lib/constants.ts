import type { TaskStatus, TaskPriority } from '../types';

export const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: '#6b7280' },
  { id: 'in_progress', title: 'In Progress', color: '#3b82f6' },
  { id: 'in_review', title: 'In Review', color: '#f59e0b' },
  { id: 'done', title: 'Done', color: '#10b981' },
];

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  urgent: { label: 'Urgent', color: '#ef4444', bg: '#fef2f2' },
  high: { label: 'High', color: '#f97316', bg: '#fff7ed' },
  medium: { label: 'Medium', color: '#eab308', bg: '#fefce8' },
  low: { label: 'Low', color: '#6b7280', bg: '#f9fafb' },
};

export const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#f43f5e', '#78716c',
];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};
