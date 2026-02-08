'use client';

import { CheckCircle, XCircle } from 'lucide-react';

interface BooleanSignalInputProps {
  signalKey: string;
  label: string;
  description?: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  required?: boolean;
}

export function BooleanSignalInput({
  signalKey,
  label,
  description,
  value,
  onChange,
  disabled = false,
  required = true,
}: BooleanSignalInputProps) {
  return (
    <div className="space-y-2" data-testid={`boolean-signal-${signalKey}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => !disabled && onChange(true)}
          disabled={disabled}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all
            ${value === true
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-pressed={value === true}
          aria-label={`${label}: Yes`}
          data-signal-key={signalKey}
          data-testid="boolean-input-yes"
        >
          <CheckCircle className={`h-5 w-5 ${value === true ? 'text-green-600' : 'text-gray-400'}`} />
          <span className="font-medium">Yes</span>
        </button>
        <button
          type="button"
          onClick={() => !disabled && onChange(false)}
          disabled={disabled}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all
            ${value === false
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-pressed={value === false}
          aria-label={`${label}: No`}
          data-signal-key={signalKey}
          data-testid="boolean-input-no"
        >
          <XCircle className={`h-5 w-5 ${value === false ? 'text-red-600' : 'text-gray-400'}`} />
          <span className="font-medium">No</span>
        </button>
      </div>
    </div>
  );
}
