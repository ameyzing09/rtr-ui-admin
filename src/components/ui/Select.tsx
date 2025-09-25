import React from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  label?: string;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  isInvalid?: boolean;
  className?: string;
  onValueChange?: (value: string | number) => void;
  id?: string;
}

export default function Select({
  options,
  value,
  defaultValue,
  placeholder = 'Select an option...',
  label,
  error,
  helpText,
  disabled = false,
  isInvalid = false,
  className = '',
  onValueChange,
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState<string | number | undefined>(
    value ?? defaultValue
  );
  const selectRef = React.useRef<HTMLDivElement>(null);
  
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = error || isInvalid;

  // Update selected value when value prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = options.find(option => option.value === selectedValue);

  const handleOptionSelect = (option: SelectOption) => {
    if (option.disabled) return;
    
    setSelectedValue(option.value);
    setIsOpen(false);
    onValueChange?.(option.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // Navigate to next option
          const currentIndex = options.findIndex(opt => opt.value === selectedValue);
          const nextIndex = Math.min(currentIndex + 1, options.length - 1);
          const nextOption = options[nextIndex];
          if (nextOption && !nextOption.disabled) {
            setSelectedValue(nextOption.value);
          }
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          // Navigate to previous option
          const currentIndex = options.findIndex(opt => opt.value === selectedValue);
          const prevIndex = Math.max(currentIndex - 1, 0);
          const prevOption = options[prevIndex];
          if (prevOption && !prevOption.disabled) {
            setSelectedValue(prevOption.value);
          }
        }
        break;
    }
  };

  const baseSelectStyles = `
    relative w-full rounded-lg border transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ring)]
    disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
  `;

  const selectStyles = `
    ${baseSelectStyles}
    ${hasError ? 'border-[var(--danger)]' : 'border-[var(--border)]'}
    ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
    bg-[var(--card)] text-[var(--app-fg)]
  `;

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-[var(--app-fg)] mb-1"
        >
          {label}
        </label>
      )}

      <div
        id={selectId}
        className={`${selectStyles} px-3 py-2 flex items-center justify-between`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? `${selectId}-listbox` : undefined}
        aria-labelledby={label ? `${selectId}-label` : undefined}
      >
        <span className={selectedOption ? 'text-[var(--app-fg)]' : 'text-[var(--muted-foreground)]'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div 
          id={`${selectId}-listbox`}
          className="absolute z-50 w-full mt-1 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          <div role="listbox" className="py-1">
            {options.map((option) => (
              <div
                key={option.value}
                role="option"
                aria-selected={option.value === selectedValue}
                className={`
                  px-3 py-2 cursor-pointer flex items-center justify-between
                  transition-colors duration-150
                  ${option.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-[var(--muted)]'
                  }
                  ${option.value === selectedValue 
                    ? 'bg-[var(--muted)] text-[var(--app-fg)]' 
                    : 'text-[var(--app-fg)]'
                  }
                `}
                onClick={() => handleOptionSelect(option)}
              >
                <span>{option.label}</span>
                {option.value === selectedValue && (
                  <Check className="w-4 h-4 text-[var(--primary)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-[var(--danger)]">{error}</p>
      )}

      {helpText && !error && (
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{helpText}</p>
      )}
    </div>
  );
}
