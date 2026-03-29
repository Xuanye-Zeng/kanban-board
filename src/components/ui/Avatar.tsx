interface AvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md';
}

export function Avatar({ name, color, size = 'md' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClass = size === 'sm' ? 'w-6 h-6 text-[9px]' : 'w-8 h-8 text-xs';

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white
        shrink-0 ring-2 ring-white shadow-sm`}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
      title={name}
    >
      {initials}
    </div>
  );
}

interface AvatarGroupProps {
  members: Array<{ name: string; color: string }>;
  max?: number;
  size?: 'sm' | 'md';
}

export function AvatarGroup({ members, max = 3, size = 'sm' }: AvatarGroupProps) {
  const visible = members.slice(0, max);
  const remaining = members.length - max;

  return (
    <div className="flex -space-x-1.5">
      {visible.map((m, i) => (
        <Avatar key={i} name={m.name} color={m.color} size={size} />
      ))}
      {remaining > 0 && (
        <div
          className={`${size === 'sm' ? 'w-6 h-6 text-[9px]' : 'w-8 h-8 text-xs'}
            rounded-full bg-gray-100 text-gray-500 flex items-center justify-center
            font-bold ring-2 ring-white shrink-0 shadow-sm`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
