import { useBoard } from '../../contexts/BoardContext';
import { PRIORITY_CONFIG } from '../../lib/constants';
import { X } from 'lucide-react';

export function FilterBar() {
  const { filters, setFilters, teamMembers, labels } = useBoard();

  const selectClass = `px-2.5 py-1.5 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg
    focus:bg-white focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-50
    text-gray-600 transition-all cursor-pointer`;

  const hasActiveFilter = filters.priority || filters.assigneeId || filters.labelId;

  return (
    <div className="flex items-center gap-2">
      <select value={filters.priority} onChange={e => setFilters({ priority: e.target.value })} className={selectClass}>
        <option value="">Priority</option>
        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
          <option key={key} value={key}>{config.label}</option>
        ))}
      </select>

      {teamMembers.length > 0 && (
        <select
          value={filters.assigneeId || ''}
          onChange={e => setFilters({ assigneeId: e.target.value ? Number(e.target.value) : null })}
          className={selectClass}
        >
          <option value="">Assignee</option>
          {teamMembers.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      )}

      {labels.length > 0 && (
        <select
          value={filters.labelId || ''}
          onChange={e => setFilters({ labelId: e.target.value ? Number(e.target.value) : null })}
          className={selectClass}
        >
          <option value="">Label</option>
          {labels.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      )}

      {hasActiveFilter && (
        <button
          onClick={() => setFilters({ priority: '', assigneeId: null, labelId: null })}
          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
        >
          <X size={11} />
          Clear
        </button>
      )}
    </div>
  );
}
