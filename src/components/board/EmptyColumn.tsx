import { Inbox } from 'lucide-react';

export function EmptyColumn() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-300">
      <div className="w-12 h-12 rounded-2xl bg-gray-100/80 flex items-center justify-center mb-3">
        <Inbox size={22} strokeWidth={1.5} />
      </div>
      <p className="text-xs font-medium text-gray-400">No tasks here</p>
      <p className="text-[10px] text-gray-300 mt-0.5">Drag a task or click + to add</p>
    </div>
  );
}
