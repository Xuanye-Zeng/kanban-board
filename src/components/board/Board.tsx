import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { COLUMNS } from '../../lib/constants';
import { useBoard } from '../../contexts/BoardContext';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import type { Task, TaskStatus } from '../../types';

interface BoardProps {
  onAddTask: (status: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
}

export function Board({ onAddTask, onTaskClick }: BoardProps) {
  const { getTasksByStatus, moveTask } = useBoard();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task;
    if (task) setActiveTask(task);
  }, []);

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Visual feedback is handled by Column's isOver state
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as number;
    const overData = over.data.current;

    // Determine target column
    let targetStatus: TaskStatus;
    let targetIndex: number;

    if (overData?.task) {
      // Dropped on another task
      const overTask = overData.task as Task;
      targetStatus = overTask.status;
      const columnTasks = getTasksByStatus(targetStatus);
      targetIndex = columnTasks.findIndex(t => t.id === overTask.id);
    } else {
      // Dropped on a column
      targetStatus = over.id as TaskStatus;
      const columnTasks = getTasksByStatus(targetStatus);
      targetIndex = columnTasks.length;
    }

    moveTask(taskId, targetStatus, targetIndex);
  }, [getTasksByStatus, moveTask]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 px-6">
        {COLUMNS.map(col => (
          <Column
            key={col.id}
            id={col.id}
            title={col.title}
            color={col.color}
            tasks={getTasksByStatus(col.id)}
            onAddTask={() => onAddTask(col.id)}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="w-72">
            <TaskCard task={activeTask} onClick={() => {}} overlay />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
