import type { Task } from '../types';

const BASE_POSITION = 65536;

export function calculatePosition(tasks: Task[], targetIndex: number): number {
  if (tasks.length === 0) return BASE_POSITION;

  if (targetIndex === 0) {
    return tasks[0].position / 2;
  }

  if (targetIndex >= tasks.length) {
    return tasks[tasks.length - 1].position + BASE_POSITION;
  }

  const prev = tasks[targetIndex - 1].position;
  const next = tasks[targetIndex].position;
  return (prev + next) / 2;
}
