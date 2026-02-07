'use client';

import { useState, useMemo } from 'react';
import { Loader2, AlertTriangle, CheckCircle, Send } from 'lucide-react';
import { BooleanSignalInput } from './signals/BooleanSignalInput';
import { NumericSignalInput } from './signals/NumericSignalInput';
import { TextSignalInput } from './signals/TextSignalInput';
import { submitEvaluationResponseAction } from '@/lib/actions/evaluation';
import { toast } from '@/components/ui/ToastProvider';
import type { SignalDefinition, SignalResponse } from '@/domain/evaluation/schemas';

interface EvaluationFormProps {
  evaluationId: string;
  signals: SignalDefinition[];
  applicantName: string;
  jobTitle?: string;
  stageName?: string;
  onSuccess?: () => void;
  disabled?: boolean;
}

type SignalValues = Record<string, boolean | number | string | null>;

export function EvaluationForm({
  evaluationId,
  signals,
  applicantName,
  jobTitle,
  stageName,
  onSuccess,
  disabled = false,
}: EvaluationFormProps) {
  const [values, setValues] = useState<SignalValues>(() => {
    // Initialize values as null (not answered)
    const initial: SignalValues = {};
    signals.forEach((signal) => {
      initial[signal.key] = null;
    });
    return initial;
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Calculate completion status
  const { completedCount, requiredCount, isComplete } = useMemo(() => {
    const requiredSignals = signals.filter((s) => s.required !== false);
    const completed = requiredSignals.filter((s) => {
      const val = values[s.key];
      if (val === null || val === undefined) return false;
      if (s.type === 'text' && typeof val === 'string' && val.trim() === '') return false;
      return true;
    });
    return {
      completedCount: completed.length,
      requiredCount: requiredSignals.length,
      isComplete: completed.length === requiredSignals.length,
    };
  }, [signals, values]);

  const handleValueChange = (key: string, value: boolean | number | string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Build response array
      const responses: SignalResponse[] = signals
        .filter((signal) => values[signal.key] !== null)
        .map((signal) => ({
          key: signal.key,
          value: values[signal.key] as boolean | number | string,
        }));

      const result = await submitEvaluationResponseAction(evaluationId, {
        responses,
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        toast({
          title: 'Evaluation submitted',
          description: `Your evaluation for ${applicantName} has been submitted successfully.`,
          variant: 'success',
        });
        setShowConfirmation(false);
        onSuccess?.();
      } else {
        toast({
          title: 'Submission failed',
          description: result.error,
          variant: 'error',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while submitting.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSignalInput = (signal: SignalDefinition) => {
    const value = values[signal.key];

    switch (signal.type) {
      case 'boolean':
        return (
          <BooleanSignalInput
            key={signal.key}
            signalKey={signal.key}
            label={signal.label}
            description={signal.description}
            value={value as boolean | null}
            onChange={(v) => handleValueChange(signal.key, v)}
            disabled={disabled || isSubmitting}
            required={signal.required}
          />
        );
      case 'numeric':
        return (
          <NumericSignalInput
            key={signal.key}
            signalKey={signal.key}
            label={signal.label}
            description={signal.description}
            value={value as number | null}
            onChange={(v) => handleValueChange(signal.key, v)}
            min={signal.min ?? 1}
            max={signal.max ?? 5}
            disabled={disabled || isSubmitting}
            required={signal.required}
          />
        );
      case 'text':
        return (
          <TextSignalInput
            key={signal.key}
            signalKey={signal.key}
            label={signal.label}
            description={signal.description}
            value={(value as string) ?? ''}
            onChange={(v) => handleValueChange(signal.key, v)}
            disabled={disabled || isSubmitting}
            required={signal.required}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Context Header */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900">{applicantName}</h3>
        <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
          {jobTitle && <span>{jobTitle}</span>}
          {jobTitle && stageName && <span>•</span>}
          {stageName && <span>{stageName}</span>}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isComplete ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${(completedCount / requiredCount) * 100}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {completedCount}/{requiredCount} completed
        </span>
      </div>

      {/* Signal Inputs */}
      <div className="space-y-6">
        {signals.map((signal) => (
          <div key={signal.key} className="p-4 border border-gray-200 rounded-lg bg-white">
            {renderSignalInput(signal)}
          </div>
        ))}
      </div>

      {/* Additional Notes */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional context or observations..."
          rows={3}
          disabled={disabled || isSubmitting}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        {!isComplete && (
          <p className="text-sm text-amber-600 flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Please complete all required fields
          </p>
        )}
        <button
          type="button"
          onClick={() => setShowConfirmation(true)}
          disabled={!isComplete || disabled || isSubmitting}
          className={`
            px-4 py-2 rounded-lg font-medium flex items-center gap-2
            ${isComplete && !disabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <Send className="h-4 w-4" />
          Submit Evaluation
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <>
          <div
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            onClick={() => !isSubmitting && setShowConfirmation(false)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div
              className="w-full max-w-md rounded-xl bg-white shadow-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirm Submission
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    You are about to submit your evaluation for <strong>{applicantName}</strong>.
                    This action cannot be undone. Your responses will be recorded permanently.
                  </p>
                </div>
              </div>

              {/* Response Summary */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                <p className="font-medium text-gray-700 mb-2">Your Responses:</p>
                <ul className="space-y-1">
                  {signals.map((signal) => {
                    const val = values[signal.key];
                    let displayValue = 'Not answered';
                    if (val !== null) {
                      if (typeof val === 'boolean') {
                        displayValue = val ? 'Yes' : 'No';
                      } else if (typeof val === 'string') {
                        displayValue = val.length > 50 ? val.slice(0, 50) + '...' : val;
                      } else {
                        displayValue = String(val);
                      }
                    }
                    return (
                      <li key={signal.key} className="flex justify-between">
                        <span className="text-gray-600">{signal.label}:</span>
                        <span className="font-medium text-gray-900">{displayValue}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Confirm & Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
