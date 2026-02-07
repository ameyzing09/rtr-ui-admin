'use client';

import { Minus, Plus } from 'lucide-react';

interface NumericSignalInputProps {
  signalKey: string;
  label: string;
  description?: string;
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  required?: boolean;
}

export function NumericSignalInput({
  signalKey,
  label,
  description,
  value,
  onChange,
  min = 1,
  max = 5,
  disabled = false,
  required = true,
}: NumericSignalInputProps) {
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  const handleDecrement = () => {
    if (value === null) {
      onChange(min);
    } else if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value === null) {
      onChange(min);
    } else if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      {/* Rating buttons for smaller ranges */}
      {range.length <= 10 ? (
        <div className="flex gap-2 flex-wrap">
          {range.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => !disabled && onChange(num)}
              disabled={disabled}
              className={`
                min-w-[40px] h-10 flex items-center justify-center rounded-lg border-2 transition-all font-medium
                ${value === num
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              aria-pressed={value === num}
              aria-label={`${label}: ${num}`}
              data-signal-key={signalKey}
            >
              {num}
            </button>
          ))}
        </div>
      ) : (
        /* Number input with increment/decrement for larger ranges */
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || value === min}
            className={`
              p-2 rounded-lg border border-gray-200 bg-white
              ${disabled || value === min ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
            `}
            aria-label="Decrease value"
          >
            <Minus className="h-4 w-4 text-gray-600" />
          </button>

          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => {
              const num = parseInt(e.target.value, 10);
              if (!isNaN(num) && num >= min && num <= max) {
                onChange(num);
              }
            }}
            min={min}
            max={max}
            disabled={disabled}
            className={`
              w-20 h-10 text-center rounded-lg border border-gray-300
              focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
              ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            `}
            placeholder="-"
            data-signal-key={signalKey}
          />

          <button
            type="button"
            onClick={handleIncrement}
            disabled={disabled || value === max}
            className={`
              p-2 rounded-lg border border-gray-200 bg-white
              ${disabled || value === max ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
            `}
            aria-label="Increase value"
          >
            <Plus className="h-4 w-4 text-gray-600" />
          </button>

          <span className="text-sm text-gray-500">
            ({min} - {max})
          </span>
        </div>
      )}

      {/* Visual scale indicator for rating buttons */}
      {range.length <= 10 && range.length >= 3 && (
        <div className="flex justify-between text-xs text-gray-400 px-1">
          <span>Low</span>
          <span>High</span>
        </div>
      )}
    </div>
  );
}
