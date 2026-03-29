import { useState, useEffect, useRef } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '../../types';
import { useBoard } from '../../contexts/BoardContext';
import { api } from '../../lib/api';
import { COLUMNS, PRIORITY_CONFIG } from '../../lib/constants';
import { PriorityBadge } from './PriorityBadge';
import { DueDateBadge } from './DueDateBadge';
import { TaskComments } from './TaskComments';
import { TaskActivityLog } from './TaskActivityLog';
import { AvatarGroup } from '../ui/Avatar';
import { LabelChip } from '../labels/LabelChip';

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
}

export function TaskDetailPanel({ task, onClose }: TaskDetailPanelProps) {
  const { updateTask, deleteTask, teamMembers, labels, refreshTasks } = useBoard();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setSelectedAssignees(task.assignees?.map(a => a.id) || []);
      setSelectedLabels(task.labels?.map(l => l.id) || []);
    }
  }, [task]);

  // Close on escape
  useEffect(() => {
    if (!task) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [task, onClose]);

  if (!task) return null;

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      updateTask(task.id, { title: title.trim() });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== (task.description || '')) {
      updateTask(task.id, { description });
    }
  };

  const handleStatusChange = (status: TaskStatus) => {
    updateTask(task.id, { status });
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    updateTask(task.id, { priority });
  };

  const handleDueDateChange = (date: string) => {
    updateTask(task.id, { due_date: date || null });
  };

  const handleAssigneeToggle = async (memberId: number) => {
    const newAssignees = selectedAssignees.includes(memberId)
      ? selectedAssignees.filter(id => id !== memberId)
      : [...selectedAssignees, memberId];
    setSelectedAssignees(newAssignees);
    await api.tasks.updateAssignees(task.id, newAssignees);
    refreshTasks();
  };

  const handleLabelToggle = async (labelId: number) => {
    const newLabels = selectedLabels.includes(labelId)
      ? selectedLabels.filter(id => id !== labelId)
      : [...selectedLabels, labelId];
    setSelectedLabels(newLabels);
    await api.tasks.updateLabels(task.id, newLabels);
    refreshTasks();
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50
        overflow-y-auto border-l border-gray-200 animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={task.priority} showLabel />
            <DueDateBadge date={task.due_date} status={task.status} />
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
              title="Delete task"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Title */}
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="w-full text-lg font-semibold text-gray-900 border-none outline-none bg-transparent
              placeholder:text-gray-300 tracking-tight"
            placeholder="Task title"
          />

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={task.status}
                onChange={e => handleStatusChange(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white
                  focus:outline-none focus:ring-2 focus:ring-indigo-50 focus:border-indigo-300"
              >
                {COLUMNS.map(col => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
              <select
                value={task.priority}
                onChange={e => handlePriorityChange(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white
                  focus:outline-none focus:ring-2 focus:ring-indigo-50 focus:border-indigo-300"
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
            <input
              type="date"
              value={task.due_date || ''}
              onChange={e => handleDueDateChange(e.target.value)}
              className="w-full px-3 py-2 text-sm font-medium border border-gray-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
            />
          </div>

          {/* Assignees */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500">Assignees</label>
              <button
                onClick={() => setShowAssigneePicker(!showAssigneePicker)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {showAssigneePicker ? 'Done' : 'Edit'}
              </button>
            </div>
            {task.assignees && task.assignees.length > 0 && !showAssigneePicker && (
              <AvatarGroup members={task.assignees} max={5} size="md" />
            )}
            {showAssigneePicker && (
              <div className="flex flex-wrap gap-2">
                {teamMembers.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleAssigneeToggle(m.id)}
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
                {teamMembers.length === 0 && (
                  <p className="text-xs text-gray-400">No team members yet</p>
                )}
              </div>
            )}
          </div>

          {/* Labels */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500">Labels</label>
              <button
                onClick={() => setShowLabelPicker(!showLabelPicker)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {showLabelPicker ? 'Done' : 'Edit'}
              </button>
            </div>
            {task.labels && task.labels.length > 0 && !showLabelPicker && (
              <div className="flex flex-wrap gap-1.5">
                {task.labels.map(l => (
                  <LabelChip key={l.id} name={l.name} color={l.color} size="md" />
                ))}
              </div>
            )}
            {showLabelPicker && (
              <div className="flex flex-wrap gap-2">
                {labels.map(l => (
                  <button
                    key={l.id}
                    onClick={() => handleLabelToggle(l.id)}
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
                {labels.length === 0 && (
                  <p className="text-xs text-gray-400">No labels yet</p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Add a description..."
              rows={4}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none
                focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all
                placeholder:text-gray-300"
            />
          </div>

          <hr className="border-gray-100/60" />

          {/* Comments */}
          <TaskComments taskId={task.id} />

          <hr className="border-gray-100" />

          {/* Activity Log */}
          <TaskActivityLog taskId={task.id} />
        </div>
      </div>
    </>
  );
}
