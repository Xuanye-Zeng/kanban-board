import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
import { PriorityBadge } from '../task/PriorityBadge';
import { DueDateBadge } from '../task/DueDateBadge';
import { AvatarGroup } from '../ui/Avatar';
import { LabelChip } from '../labels/LabelChip';
import { GripVertical } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  overlay?: boolean;
}

export function TaskCard({ task, onClick, overlay }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-lg border p-3 cursor-pointer
        transition-all duration-150
        ${overlay
          ? 'shadow-xl border-indigo-200 rotate-[1.5deg] scale-[1.02]'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
        ${isDragging ? 'z-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-1.5">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-0.5 rounded opacity-0 group-hover:opacity-100
            text-gray-300 hover:text-gray-500 transition-opacity cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={12} />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-gray-800 leading-snug">{task.title}</p>

          {task.description && (
            <p className="mt-0.5 text-[11px] text-gray-400 line-clamp-1">{task.description}</p>
          )}

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {task.labels.slice(0, 3).map(l => (
                <LabelChip key={l.id} name={l.name} color={l.color} />
              ))}
              {task.labels.length > 3 && (
                <span className="text-[10px] text-gray-400 font-medium px-1 py-0.5">
                  +{task.labels.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Bottom: priority, due date, assignees */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <PriorityBadge priority={task.priority} />
              <DueDateBadge date={task.due_date} status={task.status} />
            </div>
            {task.assignees && task.assignees.length > 0 && (
              <AvatarGroup members={task.assignees} max={3} size="sm" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
