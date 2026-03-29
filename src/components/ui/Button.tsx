import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  children: ReactNode;
}

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
  secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm',
  ghost: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3.5 py-2 text-sm',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold
        transition-all duration-150
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
        disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
