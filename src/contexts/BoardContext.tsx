import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Task, TaskStatus, TeamMember, Label, CreateTaskData, UpdateTaskData } from '../types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { calculatePosition } from '../utils/position';

interface Filters {
  search: string;
  priority: string;
  assigneeId: number | null;
  labelId: number | null;
}

interface BoardState {
  tasks: Task[];
  teamMembers: TeamMember[];
  labels: Label[];
  loading: boolean;
  error: string | null;
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  createTask: (data: CreateTaskData) => Promise<void>;
  updateTask: (id: number, data: UpdateTaskData) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  moveTask: (taskId: number, newStatus: TaskStatus, newIndex: number) => Promise<void>;
  refreshTasks: () => Promise<void>;
  refreshTeamMembers: () => Promise<void>;
  refreshLabels: () => Promise<void>;
  getTasksByStatus: (status: TaskStatus) => Task[];
}

const BoardContext = createContext<BoardState | null>(null);

export function BoardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<Filters>({
    search: '',
    priority: '',
    assigneeId: null,
    labelId: null,
  });

  const setFilters = useCallback((partial: Partial<Filters>) => {
    setFiltersState(prev => ({ ...prev, ...partial }));
  }, []);

  const refreshTasks = useCallback(async () => {
    try {
      const data = await api.tasks.list();
      // Fetch assignees and labels for each task
      const enriched = await Promise.all(
        data.map(async (task) => {
          try {
            const [assigneeData, labelData] = await Promise.all([
              api.tasks.getAssignees(task.id),
              api.tasks.getLabels(task.id),
            ]);
            return {
              ...task,
              assignees: assigneeData.map(a => a.team_members).filter(Boolean),
              labels: labelData.map(l => l.labels).filter(Boolean),
            };
          } catch {
            return { ...task, assignees: [], labels: [] };
          }
        })
      );
      setTasks(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    }
  }, []);

  const refreshTeamMembers = useCallback(async () => {
    try {
      const data = await api.teamMembers.list();
      setTeamMembers(data);
    } catch {
      // non-critical
    }
  }, []);

  const refreshLabels = useCallback(async () => {
    try {
      const data = await api.labels.list();
      setLabels(data);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([refreshTasks(), refreshTeamMembers(), refreshLabels()])
      .finally(() => setLoading(false));
  }, [user, refreshTasks, refreshTeamMembers, refreshLabels]);

  const createTask = useCallback(async (data: CreateTaskData) => {
    const statusTasks = tasks.filter(t => t.status === (data.status || 'todo'));
    const position = calculatePosition(statusTasks, statusTasks.length);
    await api.tasks.create({ ...data, position });
    await refreshTasks();
  }, [tasks, refreshTasks]);

  const updateTask = useCallback(async (id: number, data: UpdateTaskData) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    try {
      await api.tasks.update(id, data);
      await refreshTasks();
    } catch (err) {
      await refreshTasks(); // Revert on failure
      throw err;
    }
  }, [refreshTasks]);

  const deleteTask = useCallback(async (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await api.tasks.delete(id);
    } catch {
      await refreshTasks();
    }
  }, [refreshTasks]);

  const moveTask = useCallback(async (taskId: number, newStatus: TaskStatus, newIndex: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const targetTasks = tasks
      .filter(t => t.status === newStatus && t.id !== taskId)
      .sort((a, b) => a.position - b.position);

    const position = calculatePosition(targetTasks, newIndex);

    // Optimistic update
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, status: newStatus, position } : t
      )
    );

    try {
      await api.tasks.update(taskId, { status: newStatus, position });
    } catch {
      await refreshTasks();
    }
  }, [tasks, refreshTasks]);

  const getTasksByStatus = useCallback((status: TaskStatus): Task[] => {
    let filtered = tasks.filter(t => t.status === status);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }
    if (filters.priority) {
      filtered = filtered.filter(t => t.priority === filters.priority);
    }
    if (filters.assigneeId) {
      filtered = filtered.filter(t =>
        t.assignees?.some(a => a.id === filters.assigneeId)
      );
    }
    if (filters.labelId) {
      filtered = filtered.filter(t =>
        t.labels?.some(l => l.id === filters.labelId)
      );
    }

    return filtered.sort((a, b) => a.position - b.position);
  }, [tasks, filters]);

  return (
    <BoardContext.Provider
      value={{
        tasks, teamMembers, labels, loading, error, filters, setFilters,
        createTask, updateTask, deleteTask, moveTask,
        refreshTasks, refreshTeamMembers, refreshLabels, getTasksByStatus,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoard must be used within BoardProvider');
  return ctx;
}
