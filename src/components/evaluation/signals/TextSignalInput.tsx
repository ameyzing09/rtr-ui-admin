'use client';

interface TextSignalInputProps {
  signalKey: string;
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
}

export function TextSignalInput({
  signalKey,
  label,
  description,
  value,
  onChange,
  placeholder = 'Enter your response...',
  maxLength = 2000,
  rows = 4,
  disabled = false,
  required = true,
}: TextSignalInputProps) {
  const charCount = value.length;
  const isNearLimit = charCount > maxLength * 0.8;
  const isAtLimit = charCount >= maxLength;

  return (
    <div className="space-y-2" data-testid={`text-signal-${signalKey}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= maxLength) {
              onChange(e.target.value);
            }
          }}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          maxLength={maxLength}
          className={`
            w-full rounded-lg border px-3 py-2 text-sm
            focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
            resize-y min-h-[100px]
            ${disabled ? 'bg-gray-100 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'}
            ${isAtLimit ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          `}
          aria-label={label}
          data-signal-key={signalKey}
          data-testid="text-input"
        />
        <div
          className={`
            absolute bottom-2 right-2 text-xs
            ${isAtLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-gray-400'}
          `}
          data-testid="text-char-count"
        >
          {charCount}/{maxLength}
        </div>
      </div>
    </div>
  );
}
