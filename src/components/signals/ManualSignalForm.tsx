'use client';

import { useState } from 'react';
import { Plus, Loader2, X } from 'lucide-react';
import { setManualSignalAction } from '@/lib/actions/signal';
import { toast } from '@/components/ui/ToastProvider';

interface ManualSignalFormProps {
  applicationId: string;
  onSuccess?: () => void;
  className?: string;
}

type SignalType = 'boolean' | 'numeric' | 'text';

export function ManualSignalForm({
  applicationId,
  onSuccess,
  className = '',
}: ManualSignalFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signalKey, setSignalKey] = useState('');
  const [signalType, setSignalType] = useState<SignalType>('boolean');
  const [booleanValue, setBooleanValue] = useState<boolean>(true);
  const [numericValue, setNumericValue] = useState<string>('');
  const [textValue, setTextValue] = useState('');
  const [reason, setReason] = useState('');

  const resetForm = () => {
    setSignalKey('');
    setSignalType('boolean');
    setBooleanValue(true);
    setNumericValue('');
    setTextValue('');
    setReason('');
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const getValue = (): boolean | number | string => {
    switch (signalType) {
      case 'boolean':
        return booleanValue;
      case 'numeric':
        return parseFloat(numericValue);
      case 'text':
        return textValue;
    }
  };

  const isValid = (): boolean => {
    if (!signalKey.trim()) return false;
    switch (signalType) {
      case 'boolean':
        return true;
      case 'numeric':
        return numericValue !== '' && !isNaN(parseFloat(numericValue));
      case 'text':
        return textValue.trim() !== '';
    }
  };

  const handleSubmit = async () => {
    if (!isValid()) return;

    setIsSubmitting(true);
    try {
      const result = await setManualSignalAction(applicationId, {
        key: signalKey.trim(),
        value: getValue(),
        reason: reason.trim() || undefined,
      });

      if (result.success) {
        toast({
          title: 'Signal set',
          description: `Manual signal "${signalKey}" has been set successfully.`,
          variant: 'success',
        });
        handleClose();
        onSuccess?.();
      } else {
        toast({
          title: 'Failed to set signal',
          description: result.error,
          variant: 'error',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300
          text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors
          ${className}
        `}
        data-testid="manual-signal-toggle"
      >
        <Plus className="h-4 w-4" />
        Set Manual Signal
      </button>
    );
  }

  return (
    <div className={`p-4 border border-gray-200 rounded-lg bg-white ${className}`} data-testid="manual-signal-form">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Set Manual Signal</h4>
        <button
          onClick={handleClose}
          className="p-1 rounded hover:bg-gray-100"
          aria-label="Close"
          data-testid="manual-signal-close-btn"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Signal Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Signal Key <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={signalKey}
            onChange={(e) => setSignalKey(e.target.value)}
            placeholder="e.g., hr_override_approved"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSubmitting}
            data-testid="manual-signal-key"
          />
        </div>

        {/* Signal Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <div className="flex gap-2">
            {(['boolean', 'numeric', 'text'] as SignalType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSignalType(type)}
                disabled={isSubmitting}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium capitalize
                  ${signalType === type
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }
                `}
                data-testid={`manual-signal-type-${type}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Value Input based on Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Value <span className="text-red-500">*</span>
          </label>
          {signalType === 'boolean' && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBooleanValue(true)}
                disabled={isSubmitting}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium
                  ${booleanValue
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }
                `}
                data-testid="manual-signal-boolean-true"
              >
                True
              </button>
              <button
                type="button"
                onClick={() => setBooleanValue(false)}
                disabled={isSubmitting}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium
                  ${!booleanValue
                    ? 'bg-red-100 text-red-700 border-2 border-red-500'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }
                `}
                data-testid="manual-signal-boolean-false"
              >
                False
              </button>
            </div>
          )}
          {signalType === 'numeric' && (
            <input
              type="number"
              value={numericValue}
              onChange={(e) => setNumericValue(e.target.value)}
              placeholder="Enter a number"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
              data-testid="manual-signal-numeric-value"
            />
          )}
          {signalType === 'text' && (
            <textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Enter text value"
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
              disabled={isSubmitting}
              data-testid="manual-signal-text-value"
            />
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you setting this signal manually?"
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
            disabled={isSubmitting}
            data-testid="manual-signal-reason"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            data-testid="manual-signal-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid() || isSubmitting}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="manual-signal-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Setting...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Set Signal
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
