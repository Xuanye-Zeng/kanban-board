export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  position: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  assignees?: TeamMember[];
  labels?: Label[];
}

export interface TeamMember {
  id: number;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: number;
  task_id: number;
  content: string;
  user_id: string;
  created_at: string;
}

export interface ActivityLogEntry {
  id: number;
  task_id: number;
  action: string;
  details: Record<string, unknown>;
  user_id: string;
  created_at: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  position?: number;
  assignee_ids?: number[];
  label_ids?: number[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  position?: number;
}
