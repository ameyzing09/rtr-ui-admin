import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightIconClick?: () => void;
  variant?: 'default' | 'filled';
  isInvalid?: boolean;
}

export default function Input({
  label,
  error,
  helpText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconClick,
  variant = 'default',
  isInvalid,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = error || isInvalid;

  const baseInputStyles = `
    block w-full rounded-lg border transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ring)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles = {
    default: `
      border-[var(--border)] bg-[var(--card)] text-[var(--app-fg)]
      ${hasError ? 'border-[var(--danger)]' : ''}
    `,
    filled: `
      border-[var(--border)] bg-[var(--muted)] text-[var(--app-fg)]
      ${hasError ? 'border-[var(--danger)]' : ''}
    `,
  };

  const sizeStyles = LeftIcon || RightIcon ? 'py-2' : 'px-3 py-2';
  const paddingStyles = `
    ${LeftIcon ? 'pl-10' : 'pl-3'}
    ${RightIcon ? 'pr-10' : 'pr-3'}
  `;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        
        <input
          id={inputId}
          className={`
            ${baseInputStyles}
            ${variantStyles[variant]}
            ${sizeStyles}
            ${paddingStyles}
          `}
          {...props}
        />
        
        {RightIcon && (
          <div
            className={`
              absolute inset-y-0 right-0 pr-3 flex items-center
              ${onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'}
            `}
            onClick={onRightIconClick}
          >
            <RightIcon className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
}
