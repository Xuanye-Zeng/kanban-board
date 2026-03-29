import { supabase } from './supabase';
import type {
  Task, TeamMember, Label, Comment, ActivityLogEntry,
  CreateTaskData, UpdateTaskData,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function getToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : (null as T);
}

// Tasks
export const api = {
  tasks: {
    list: () => request<Task[]>('/api/tasks'),
    create: (data: CreateTaskData) =>
      request<Task[]>('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: UpdateTaskData) =>
      request<Task[]>(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
    updateAssignees: (id: number, teamMemberIds: number[]) =>
      request<void>(`/api/tasks/${id}/assignees`, {
        method: 'PUT',
        body: JSON.stringify({ team_member_ids: teamMemberIds }),
      }),
    updateLabels: (id: number, labelIds: number[]) =>
      request<void>(`/api/tasks/${id}/labels`, {
        method: 'PUT',
        body: JSON.stringify({ label_ids: labelIds }),
      }),
    getAssignees: (id: number) =>
      request<Array<{ team_member_id: number; team_members: TeamMember }>>(`/api/tasks/${id}/assignees`),
    getLabels: (id: number) =>
      request<Array<{ label_id: number; labels: Label }>>(`/api/tasks/${id}/labels`),
  },

  comments: {
    list: (taskId: number) => request<Comment[]>(`/api/tasks/${taskId}/comments`),
    create: (taskId: number, content: string) =>
      request<Comment[]>(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    delete: (taskId: number, id: number) =>
      request<void>(`/api/tasks/${taskId}/comments/${id}`, { method: 'DELETE' }),
  },

  activity: {
    list: (taskId: number) => request<ActivityLogEntry[]>(`/api/tasks/${taskId}/activity`),
  },

  teamMembers: {
    list: () => request<TeamMember[]>('/api/team-members'),
    create: (name: string, color: string) =>
      request<TeamMember[]>('/api/team-members', {
        method: 'POST',
        body: JSON.stringify({ name, color }),
      }),
    update: (id: number, name: string, color: string) =>
      request<TeamMember[]>(`/api/team-members/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, color }),
      }),
    delete: (id: number) =>
      request<void>(`/api/team-members/${id}`, { method: 'DELETE' }),
  },

  labels: {
    list: () => request<Label[]>('/api/labels'),
    create: (name: string, color: string) =>
      request<Label[]>('/api/labels', {
        method: 'POST',
        body: JSON.stringify({ name, color }),
      }),
    update: (id: number, name: string, color: string) =>
      request<Label[]>(`/api/labels/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, color }),
      }),
    delete: (id: number) =>
      request<void>(`/api/labels/${id}`, { method: 'DELETE' }),
  },
};
