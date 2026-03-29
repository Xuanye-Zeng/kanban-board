import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BoardProvider } from './contexts/BoardContext';
import { Header } from './components/layout/Header';
import { Board } from './components/board/Board';
import { CreateTaskModal } from './components/task/CreateTaskModal';
import { TaskDetailPanel } from './components/task/TaskDetailPanel';
import { TeamManagerModal } from './components/team/TeamManagerModal';
import { LabelManagerModal } from './components/labels/LabelManagerModal';
import { Spinner } from './components/ui/Spinner';
import type { Task, TaskStatus } from './types';

function AppContent() {
  const { user, loading, error } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>('todo');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [labelModalOpen, setLabelModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Spinner size="md" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">Task Board</p>
            <p className="text-xs text-gray-400 mt-0.5">Setting up your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 animate-scale-in">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3">
            <span className="text-rose-500 text-lg">!</span>
          </div>
          <p className="text-rose-600 text-sm font-medium">{error || 'Authentication failed'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleAddTask = (status: TaskStatus) => {
    setCreateDefaultStatus(status);
    setCreateModalOpen(true);
  };

  return (
    <BoardProvider>
      <div className="h-screen flex flex-col bg-[#f5f5f7]">
        <Header
          onOpenTeamManager={() => setTeamModalOpen(true)}
          onOpenLabelManager={() => setLabelModalOpen(true)}
        />
        <main className="flex-1 overflow-hidden py-4">
          <Board onAddTask={handleAddTask} onTaskClick={setSelectedTask} />
        </main>
      </div>

      <CreateTaskModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultStatus={createDefaultStatus}
      />

      <TaskDetailPanel
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      <TeamManagerModal open={teamModalOpen} onClose={() => setTeamModalOpen(false)} />
      <LabelManagerModal open={labelModalOpen} onClose={() => setLabelModalOpen(false)} />
    </BoardProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
