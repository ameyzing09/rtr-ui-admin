import React from 'react';
import { X } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
}

export default function Badge({
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  children,
  className = '',
  ...props
}: BadgeProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-1 rounded-full font-medium
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const variants = {
    default: `
      bg-[var(--muted)] text-[var(--muted-foreground)]
      border border-[var(--border)]
    `,
    primary: `
      bg-[var(--primary)] text-[var(--primary-foreground)]
      focus:ring-[var(--primary)]
    `,
    secondary: `
      bg-[var(--secondary)] text-[var(--secondary-foreground)]
      focus:ring-[var(--secondary)]
    `,
    success: `
      bg-green-100 text-green-800 border border-green-200
      dark:bg-green-900/30 dark:text-green-400 dark:border-green-800
    `,
    warning: `
      bg-yellow-100 text-yellow-800 border border-yellow-200
      dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800
    `,
    danger: `
      bg-red-100 text-red-800 border border-red-200
      dark:bg-red-900/30 dark:text-red-400 dark:border-red-800
    `,
    outline: `
      bg-transparent text-[var(--app-fg)] border border-[var(--border)]
      hover:bg-[var(--muted)]
    `,
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <span
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
      
      {removable && onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          className={`
            ml-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10
            transition-colors duration-150 focus:outline-none
            focus:ring-1 focus:ring-current
          `}
          aria-label="Remove badge"
        >
          <X className={iconSizes[size]} />
        </button>
      )}
    </span>
  );
}
