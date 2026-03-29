import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useBoard } from '../../contexts/BoardContext';
import { PRIORITY_CONFIG } from '../../lib/constants';
import type { TaskStatus, TaskPriority } from '../../types';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  defaultStatus: TaskStatus;
}

export function CreateTaskModal({ open, onClose, defaultStatus }: CreateTaskModalProps) {
  const { createTask, teamMembers, labels } = useBoard();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        status: defaultStatus,
        priority,
        due_date: dueDate || null,
        assignee_ids: selectedAssignees,
        label_ids: selectedLabels,
      });
      // Reset and close
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setSelectedAssignees([]);
      setSelectedLabels([]);
      onClose();
    } catch {
      // error handled by context
    } finally {
      setLoading(false);
    }
  };

  const toggleAssignee = (id: number) => {
    setSelectedAssignees(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleLabel = (id: number) => {
    setSelectedLabels(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Task" width="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add more details..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Priority + Due Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Assignees */}
        {teamMembers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignees</label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleAssignee(m.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                    border transition-colors ${
                      selectedAssignees.includes(m.id)
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <span className="w-4 h-4 rounded-full text-[8px] text-white flex items-center justify-center"
                    style={{ backgroundColor: m.color }}>
                    {m.name[0]}
                  </span>
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Labels */}
        {labels.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
            <div className="flex flex-wrap gap-2">
              {labels.map(l => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => toggleLabel(l.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                    border transition-colors ${
                      selectedLabels.includes(l.id)
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                  {l.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" disabled={!title.trim() || loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
