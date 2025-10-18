'use client';

import { useState, ReactNode } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  validate?: () => Promise<boolean> | boolean;
}

interface FormWizardProps {
  steps: WizardStep[];
  onComplete: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

/**
 * Form Wizard Component
 * Multi-step form with validation and progress indicator
 */
export function FormWizard({
  steps,
  onComplete,
  onCancel,
  isSubmitting = false,
  className = '',
}: FormWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [validationError, setValidationError] = useState<string | null>(null);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  /**
   * Go to next step (with validation)
   */
  const handleNext = async () => {
    setValidationError(null);

    // Validate current step if validation function exists
    if (currentStep.validate) {
      try {
        const isValid = await currentStep.validate();
        if (!isValid) {
          setValidationError('Please fix the errors before continuing');
          return;
        }
      } catch (error) {
        setValidationError(error instanceof Error ? error.message : 'Validation failed');
        return;
      }
    }

    // Mark current step as completed
    setCompletedSteps((prev) => new Set(prev).add(currentStepIndex));

    if (isLastStep) {
      // Complete wizard
      onComplete();
    } else {
      // Move to next step
      setCurrentStepIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Go to previous step
   */
  const handlePrevious = () => {
    setValidationError(null);
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Jump to a specific step
   */
  const handleStepClick = (index: number) => {
    // Only allow jumping to completed steps or the next step
    if (index <= currentStepIndex || completedSteps.has(index - 1)) {
      setValidationError(null);
      setCurrentStepIndex(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Step Indicator */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.has(index);
              const isCurrent = index === currentStepIndex;
              const isAccessible = index <= currentStepIndex || completedSteps.has(index - 1);

              return (
                <li key={step.id} className="flex items-center">
                  {/* Step Circle */}
                  <button
                    type="button"
                    onClick={() => handleStepClick(index)}
                    disabled={!isAccessible}
                    className={`group flex items-center ${!isAccessible ? 'cursor-not-allowed' : ''}`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                        isCompleted
                          ? 'border-blue-600 bg-blue-600'
                          : isCurrent
                          ? 'border-blue-600 bg-white'
                          : isAccessible
                          ? 'border-gray-300 bg-white group-hover:border-blue-600'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <span
                          className={`text-sm font-semibold ${
                            isCurrent
                              ? 'text-blue-600'
                              : isAccessible
                              ? 'text-gray-500 group-hover:text-blue-600'
                              : 'text-gray-300'
                          }`}
                        >
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="ml-3 hidden text-left sm:block">
                      <p
                        className={`text-sm font-medium ${
                          isCurrent
                            ? 'text-blue-600'
                            : isAccessible
                            ? 'text-gray-700'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.title}
                      </p>
                      {step.description && (
                        <p className="text-xs text-gray-500">{step.description}</p>
                      )}
                    </div>
                  </button>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`ml-4 h-0.5 w-12 ${
                        isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-8">
        <div className="mx-auto max-w-3xl">
          {/* Current Step Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{currentStep.title}</h2>
            {currentStep.description && (
              <p className="mt-2 text-sm text-gray-600">{currentStep.description}</p>
            )}
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{validationError}</p>
            </div>
          )}

          {/* Step Content */}
          <div>{currentStep.content}</div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Previous Button */}
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrevious}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
            )}

            {/* Next/Submit Button */}
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Submitting...
                </>
              ) : isLastStep ? (
                'Submit'
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
