interface LabelChipProps {
  name: string;
  color: string;
  size?: 'sm' | 'md';
  onRemove?: () => void;
}

export function LabelChip({ name, color, size = 'sm', onRemove }: LabelChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold
        ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}
      style={{ backgroundColor: color + '18', color, border: `1px solid ${color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 hover:opacity-70 font-bold">&times;</button>
      )}
    </span>
  );
}
