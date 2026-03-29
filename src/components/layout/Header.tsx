import { Users, Tags, Kanban } from 'lucide-react';
import { SearchInput } from '../filters/SearchInput';
import { FilterBar } from '../filters/FilterBar';
import { BoardStats } from './BoardStats';
import { Button } from '../ui/Button';

interface HeaderProps {
  onOpenTeamManager: () => void;
  onOpenLabelManager: () => void;
}

export function Header({ onOpenTeamManager, onOpenLabelManager }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200/80">
      {/* Top bar */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Kanban size={16} className="text-white" />
          </div>
          <h1 className="text-[15px] font-bold text-gray-900 tracking-tight">Task Board</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onOpenTeamManager}>
            <Users size={14} />
            <span className="hidden sm:inline">Team</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenLabelManager}>
            <Tags size={14} />
            <span className="hidden sm:inline">Labels</span>
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-6 py-2 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <SearchInput />
          <FilterBar />
        </div>
        <BoardStats />
      </div>
    </header>
  );
}
