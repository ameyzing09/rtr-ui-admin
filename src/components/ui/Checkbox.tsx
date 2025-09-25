import React from 'react';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
  variant?: 'default' | 'primary';
  size?: 'sm' | 'md' | 'lg';
}

export default function Checkbox({
  label,
  description,
  error,
  indeterminate = false,
  variant = 'default',
  size = 'md',
  className = '',
  id,
  checked,
  onChange,
  disabled,
  ...props
}: CheckboxProps) {
  const checkboxRef = React.useRef<HTMLInputElement>(null);
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  // Set indeterminate state
  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const sizes = {
    sm: {
      checkbox: 'w-4 h-4',
      icon: 'w-3 h-3',
      text: 'text-sm',
    },
    md: {
      checkbox: 'w-5 h-5',
      icon: 'w-3.5 h-3.5',
      text: 'text-sm',
    },
    lg: {
      checkbox: 'w-6 h-6',
      icon: 'w-4 h-4',
      text: 'text-base',
    },
  };

  const variants = {
    default: {
      container: '',
      checkbox: `
        border-[var(--border)] bg-[var(--card)]
        checked:bg-[var(--primary)] checked:border-[var(--primary)]
        focus:ring-[var(--ring)]
      `,
      label: 'text-[var(--app-fg)]',
      description: 'text-[var(--muted-foreground)]',
    },
    primary: {
      container: '',
      checkbox: `
        border-[var(--primary)] bg-[var(--card)]
        checked:bg-[var(--primary)] checked:border-[var(--primary)]
        focus:ring-[var(--primary)]
      `,
      label: 'text-[var(--app-fg)]',
      description: 'text-[var(--muted-foreground)]',
    },
  };

  const baseCheckboxStyles = `
    rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
    appearance-none flex items-center justify-center
  `;

  const isChecked = indeterminate ? false : checked;
  const showIcon = isChecked || indeterminate;

  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="relative flex items-center">
        <input
          ref={checkboxRef}
          id={checkboxId}
          type="checkbox"
          className={`
            ${baseCheckboxStyles}
            ${sizes[size].checkbox}
            ${variants[variant].checkbox}
          `}
          checked={isChecked}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
        
        {/* Custom checkbox indicator */}
        {showIcon && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {indeterminate ? (
              <Minus className={`${sizes[size].icon} text-white`} />
            ) : (
              <Check className={`${sizes[size].icon} text-white`} />
            )}
          </div>
        )}
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={checkboxId}
              className={`
                font-medium cursor-pointer
                ${sizes[size].text}
                ${variants[variant].label}
                ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              `}
            >
              {label}
            </label>
          )}
          
          {description && (
            <p className={`
              ${sizes[size].text}
              ${variants[variant].description}
              ${disabled ? 'opacity-50' : ''}
            `}>
              {description}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-[var(--danger)]">{error}</p>
      )}
    </div>
  );
}
