import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 rounded-lg font-medium
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary:
      'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 focus:ring-[var(--primary)]',
    secondary:
      'bg-[var(--card)] text-[var(--app-fg)] border border-[var(--border)] hover:opacity-95 focus:ring-[var(--ring)]',
    outline:
      'border border-[var(--border)] text-[var(--app-fg)] hover:bg-[var(--card)] focus:ring-[var(--ring)]',
    ghost: 'text-[var(--app-fg)] hover:bg-[var(--muted)] focus:ring-[var(--ring)]',
    danger:
      'bg-[var(--danger)] text-[var(--danger-foreground)] hover:opacity-90 focus:ring-[var(--danger)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconSizes[size]}`} />
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={iconSizes[size]} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className={iconSizes[size]} />
          )}
        </>
      )}
    </button>
  );
}
