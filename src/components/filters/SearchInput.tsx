import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useBoard } from '../../contexts/BoardContext';

export function SearchInput() {
  const { filters, setFilters } = useBoard();
  const [value, setValue] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => setFilters({ search: value }), 300);
    return () => clearTimeout(timer);
  }, [value, setFilters]);

  return (
    <div className="relative">
      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Search tasks..."
        className="w-48 pl-8 pr-7 py-1.5 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg
          focus:bg-white focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-50
          placeholder:text-gray-400 transition-all"
      />
      {value && (
        <button
          onClick={() => { setValue(''); setFilters({ search: '' }); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
