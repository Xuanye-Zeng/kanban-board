import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { formatRelativeTime } from '../../utils/dates';
import { STATUS_LABELS } from '../../lib/constants';
import { Activity } from 'lucide-react';
import type { ActivityLogEntry, TaskStatus } from '../../types';

function formatAction(entry: ActivityLogEntry): string {
  const d = entry.details as Record<string, string>;
  switch (entry.action) {
    case 'created':
      return 'Task created';
    case 'status_changed':
      return `Moved from ${STATUS_LABELS[d.from as TaskStatus] || d.from} → ${STATUS_LABELS[d.to as TaskStatus] || d.to}`;
    case 'priority_changed':
      return `Priority changed from ${d.from} to ${d.to}`;
    case 'edited':
      return `${d.field || 'Task'} updated`;
    case 'assignees_updated':
      return 'Assignees updated';
    case 'labels_updated':
      return 'Labels updated';
    case 'comment_added':
      return 'Comment added';
    default:
      return entry.action;
  }
}

export function TaskActivityLog({ taskId }: { taskId: number }) {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);

  useEffect(() => {
    api.activity.list(taskId).then(setEntries).catch(() => {});
  }, [taskId]);

  if (entries.length === 0) {
    return (
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Activity</h4>
        <p className="text-xs text-gray-400">No activity yet</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Activity</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {entries.map(entry => (
          <div key={entry.id} className="flex items-start gap-2 text-xs">
            <Activity size={12} className="text-gray-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-gray-600">{formatAction(entry)}</span>
              <span className="text-gray-400 ml-1">· {formatRelativeTime(entry.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
