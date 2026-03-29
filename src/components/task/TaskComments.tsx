import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { formatRelativeTime } from '../../utils/dates';
import { Send, Trash2 } from 'lucide-react';
import type { Comment } from '../../types';

export function TaskComments({ taskId }: { taskId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      const data = await api.comments.list(taskId);
      setComments(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => { fetchComments(); }, [taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await api.comments.create(taskId, content.trim());
      setContent('');
      await fetchComments();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    await api.comments.delete(taskId, id);
    setComments(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">Comments</h4>

      {comments.length === 0 && (
        <p className="text-xs text-gray-400">No comments yet</p>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {comments.map(c => (
          <div key={c.id} className="group flex gap-2 p-2 rounded-lg bg-gray-50">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-medium shrink-0">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">{c.content}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{formatRelativeTime(c.created_at)}</p>
            </div>
            <button
              onClick={() => handleDelete(c.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
