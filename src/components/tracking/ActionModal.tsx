'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, Loader2, AlertTriangle, Lock, Info, ExternalLink, CheckCircle } from 'lucide-react';
import { getAvailableActionsAction, executeActionAction } from '@/lib/actions/tracking';
import { TrackingStatusBadge } from './TrackingStatusBadge';
import { toast } from '@/components/ui/ToastProvider';
import type { AvailableAction, EvaluationRequirement, OutcomeType } from '@/domain/tracking/schemas';
import { getOutcomeTypeStyle } from '@/domain/tracking/schemas';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  applicantName: string;
  // Tracking state passed from parent (drawer already fetches this)
  currentStatus?: string;
  currentStageName?: string;
  currentOutcomeType?: OutcomeType;
  isTerminal?: boolean;
  onSuccess?: () => void;
  onCreateInterview?: () => void;
}

/**
 * Get button style classes based on outcome type
 */
function getActionButtonClasses(outcomeType: OutcomeType | null, isSelected: boolean): string {
  const base = 'w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left';

  if (!isSelected) {
    return `${base} border-gray-200 hover:border-gray-300 bg-white`;
  }

  switch (outcomeType) {
    case 'ACTIVE':
      return `${base} border-blue-500 bg-blue-50`;
    case 'HOLD':
      return `${base} border-amber-500 bg-amber-50`;
    case 'SUCCESS':
      return `${base} border-green-500 bg-green-50`;
    case 'FAILURE':
      return `${base} border-red-500 bg-red-50`;
    case 'NEUTRAL':
    default:
      return `${base} border-gray-500 bg-gray-50`;
  }
}

/**
 * Get confirm button style based on outcome type
 */
function getConfirmButtonClasses(outcomeType: OutcomeType | null, isTerminal: boolean): string {
  if (isTerminal) {
    return 'bg-red-600 hover:bg-red-700 text-white';
  }

  switch (outcomeType) {
    case 'ACTIVE':
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    case 'HOLD':
      return 'bg-amber-600 hover:bg-amber-700 text-white';
    case 'SUCCESS':
      return 'bg-green-600 hover:bg-green-700 text-white';
    case 'FAILURE':
      return 'bg-red-600 hover:bg-red-700 text-white';
    case 'NEUTRAL':
    default:
      return 'bg-gray-600 hover:bg-gray-700 text-white';
  }
}

export function ActionModal({
  isOpen,
  onClose,
  applicationId,
  applicantName,
  currentStatus: propStatus = '',
  currentStageName: propStageName = '',
  currentOutcomeType: propOutcomeType = 'ACTIVE',
  isTerminal: propIsTerminal = false,
  onSuccess,
  onCreateInterview,
}: ActionModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableActions, setAvailableActions] = useState<AvailableAction[]>([]);
  const [evaluationsComplete, setEvaluationsComplete] = useState(true);
  const [requiredEvaluations, setRequiredEvaluations] = useState<EvaluationRequirement[]>([]);

  // Use props passed from parent drawer (which has the tracking state)
  const currentStatus = propStatus;
  const currentStageName = propStageName;
  const currentOutcomeType = propOutcomeType;
  const isTerminalState = propIsTerminal;
  const [selectedAction, setSelectedAction] = useState<AvailableAction | null>(null);
  const [notes, setNotes] = useState('');

  const loadActions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAvailableActionsAction(applicationId);
      if (result.success) {
        setAvailableActions(result.data.availableActions);
        setEvaluationsComplete(result.data.evaluationsComplete);
        setRequiredEvaluations(result.data.requiredEvaluations);
      } else {
        toast({
          title: 'Failed to load actions',
          description: result.error,
          variant: 'error',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load available actions',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    if (isOpen) {
      setSelectedAction(null);
      setNotes('');
      loadActions();
    }
  }, [isOpen, applicationId, loadActions]);

  const handleSubmit = async () => {
    if (!selectedAction) return;

    setIsSubmitting(true);
    try {
      const result = await executeActionAction(applicationId, {
        action: selectedAction.actionCode,
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        toast({
          title: 'Action executed',
          description: `${selectedAction.displayName} applied to ${applicantName}`,
          variant: 'success',
        });
        onClose();
        onSuccess?.();
      } else {
        toast({
          title: 'Action failed',
          description: result.error,
          variant: 'error',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionsBlocked = requiredEvaluations.length > 0 && !evaluationsComplete;
  const incompleteEvaluations = requiredEvaluations.filter((e) => !e.completed);
  const pendingEvaluations = incompleteEvaluations.filter(
    (e) => e.instanceStatus !== 'IN_PROGRESS'
  );
  const inProgressEvaluations = incompleteEvaluations.filter(
    (e) => e.instanceStatus === 'IN_PROGRESS'
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          data-testid="action-modal"
          className="w-full max-w-lg rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Take Action
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                {/* Applicant Info */}
                <div>
                  <p className="text-sm text-gray-500">Applicant</p>
                  <p className="font-medium text-gray-900">{applicantName}</p>
                </div>

                {/* Current State */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <TrackingStatusBadge
                      status={currentStatus}
                      outcomeType={currentOutcomeType}
                      size="md"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Stage</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                      {currentStageName}
                    </span>
                  </div>
                </div>

                {/* Evaluation: fail-open badge (no evaluations configured) */}
                {!isTerminalState && requiredEvaluations.length === 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Info className="h-3.5 w-3.5" />
                    <span>Evaluation not configured</span>
                  </div>
                )}

                {/* Evaluation: in-progress block (evaluators submitted, not yet completed) */}
                {!isTerminalState && actionsBlocked && inProgressEvaluations.length > 0 && (
                  <div
                    className="flex items-start gap-3 rounded-lg bg-blue-50 border border-blue-200 p-4"
                    data-testid="evaluation-in-progress-info"
                  >
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Stage evaluation ready to complete
                      </p>
                      <div className="mt-2 space-y-1">
                        {inProgressEvaluations.map((e) => (
                          <div key={e.templateId} className="space-y-1">
                            <p className="text-xs text-blue-600">
                              All evaluators have submitted responses for the &ldquo;{e.templateName}&rdquo; stage evaluation.
                            </p>
                            <p className="text-xs text-blue-500">
                              Complete the stage evaluation to advance this candidate.
                            </p>
                            {e.instanceId && (
                              <Link
                                href={`/dashboard/evaluations/${e.instanceId}`}
                                className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 underline hover:text-blue-900"
                                data-testid="evaluation-gate-complete-evaluation"
                              >
                                Complete Evaluation &rarr;
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Evaluation: pending block (no submissions yet) */}
                {!isTerminalState && actionsBlocked && pendingEvaluations.length > 0 && (
                  <div
                    className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4"
                    data-testid="evaluation-gate-warning"
                  >
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        Stage evaluation required
                      </p>
                      <div className="mt-2 space-y-1">
                        {pendingEvaluations.map((e) => (
                          <div key={e.templateId} className="space-y-1">
                            <p className="text-xs text-amber-600">
                              Complete the required stage evaluation for {currentStageName} before advancing this candidate. Interview feedback does not satisfy this requirement.
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              {e.instanceId ? (
                                <Link
                                  href={`/dashboard/evaluations/${e.instanceId}`}
                                  className="inline-flex items-center gap-1 text-sm text-amber-700 underline hover:text-amber-900"
                                  data-testid="evaluation-gate-go-evaluation"
                                >
                                  Go to Evaluation
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              ) : (
                                <p className="text-xs text-amber-500" data-testid="evaluation-gate-not-created">
                                  Stage evaluation is not created yet. Refresh or contact an administrator if this persists.
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Terminal State */}
                {isTerminalState && (
                  <div className="flex items-start gap-3 rounded-lg bg-gray-50 border border-gray-200 p-4">
                    <Lock className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Application Finalized
                      </p>
                      <p className="text-sm text-gray-600">
                        This application has reached a terminal state. No further actions are available.
                      </p>
                    </div>
                  </div>
                )}

                {/* Available Actions */}
                {!isTerminalState && availableActions.length === 0 && (
                  <div className="text-sm text-gray-500 py-4 text-center">
                    No actions available for this application.
                  </div>
                )}

                {!isTerminalState && availableActions.length > 0 && (
                  <div className={actionsBlocked ? 'opacity-50 pointer-events-none' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Actions
                    </label>
                    <div className="space-y-2">
                      {availableActions.map((action) => {
                        const isSelected = selectedAction?.actionCode === action.actionCode;
                        const style = action.outcomeType ? getOutcomeTypeStyle(action.outcomeType) : { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };

                        return (
                          <button
                            key={action.actionCode}
                            data-testid={`action-card-${action.actionCode}`}
                            onClick={() => {
                              setSelectedAction(isSelected ? null : action);
                              if (!isSelected) setNotes('');
                            }}
                            className={`${getActionButtonClasses(action.outcomeType, isSelected)} cursor-pointer`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {action.displayName}
                                </span>
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}
                                >
                                  {action.outcomeType}
                                </span>
                                {action.isTerminal && (
                                  <span
                                    data-testid="terminal-badge"
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700"
                                  >
                                    Final
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Terminal Action Warning */}
                {selectedAction?.isTerminal && (
                  <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        This is a final decision
                      </p>
                      <p className="text-sm text-red-700">
                        This action will finalize the application. It cannot be undone.
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedAction && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes {selectedAction.requiresNotes ? <span className="text-red-500">*</span> : '(optional)'}
                    </label>
                    <textarea
                      data-testid="action-notes-input"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add a note about this action..."
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            {selectedAction && (
              <button
                data-testid="action-submit-btn"
                onClick={handleSubmit}
                disabled={isSubmitting || (selectedAction.requiresNotes && !notes.trim())}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg
                  ${getConfirmButtonClasses(selectedAction.outcomeType, selectedAction.isTerminal)}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Executing...
                  </>
                ) : (
                  selectedAction.displayName
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
