import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Trash2 } from 'lucide-react';
import { useBoard } from '../../contexts/BoardContext';
import { api } from '../../lib/api';
import { PRESET_COLORS } from '../../lib/constants';

interface TeamManagerModalProps {
  open: boolean;
  onClose: () => void;
}

export function TeamManagerModal({ open, onClose }: TeamManagerModalProps) {
  const { teamMembers, refreshTeamMembers } = useBoard();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[6]); // default indigo
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api.teamMembers.create(name.trim(), color);
      setName('');
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      await refreshTeamMembers();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    await api.teamMembers.delete(id);
    refreshTeamMembers();
  };

  return (
    <Modal open={open} onClose={onClose} title="Team Members" width="max-w-sm">
      <div className="space-y-4">
        {/* Existing members */}
        {teamMembers.length > 0 && (
          <div className="space-y-2">
            {teamMembers.map(m => (
              <div key={m.id} className="flex items-center gap-3 group">
                <Avatar name={m.name} color={m.color} size="md" />
                <span className="flex-1 text-sm text-gray-700">{m.name}</span>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {teamMembers.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No team members yet</p>
        )}

        <hr className="border-gray-100" />

        {/* Add new */}
        <div className="space-y-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Member name"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
          />
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full transition-transform ${
                  color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <Button onClick={handleAdd} disabled={!name.trim() || loading} className="w-full">
            Add Member
          </Button>
        </div>
      </div>
    </Modal>
  );
}
