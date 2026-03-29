import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { EmptyColumn } from './EmptyColumn';
import { Plus } from 'lucide-react';

interface ColumnProps {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
}

export function Column({ id, title, color, tasks, onAddTask, onTaskClick }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col w-[280px] shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-[13px] font-semibold text-gray-700">{title}</h3>
          <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 min-w-[20px] h-5 px-1.5 rounded-md flex items-center justify-center">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="p-1 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Task list */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-1.5 space-y-1.5 min-h-[200px] transition-all duration-200
          ${isOver
            ? 'bg-indigo-50 ring-2 ring-indigo-200 ring-inset'
            : 'bg-gray-100/50'
          }`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <EmptyColumn />
          ) : (
            tasks.map((task, index) => (
              <div key={task.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 30}ms` }}>
                <TaskCard task={task} onClick={() => onTaskClick(task)} />
              </div>
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
