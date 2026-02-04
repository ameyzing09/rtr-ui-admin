'use client';

import { useState } from 'react';
import { X, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import { moveStageAction } from '@/lib/actions/tracking';
import { toast } from '@/components/ui/ToastProvider';
import type { PipelineStage } from '@/domain/tracking/schemas';
import { isAdjacentMove } from '@/domain/tracking/schemas';

interface MoveStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  applicantName: string;
  currentStageId: string;
  currentStageIndex: number;
  pipelineStages: PipelineStage[];
  isTerminal: boolean;
  onSuccess?: () => void;
}

export function MoveStageModal({
  isOpen,
  onClose,
  applicationId,
  applicantName,
  currentStageId,
  currentStageIndex,
  pipelineStages,
  isTerminal,
  onSuccess,
}: MoveStageModalProps) {
  const [targetStageId, setTargetStageId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find current stage
  const currentStage = pipelineStages.find((s) => s.id === currentStageId);

  // Get adjacent stages only
  const adjacentStages = pipelineStages.filter((stage) =>
    isAdjacentMove(currentStageIndex, stage.orderIndex)
  );

  // Find target stage index
  const targetStage = pipelineStages.find((s) => s.id === targetStageId);
  const targetStageIndex = targetStage?.orderIndex ?? -1;

  const handleSubmit = async () => {
    if (!targetStageId || isTerminal) return;

    setIsSubmitting(true);

    try {
      const result = await moveStageAction(
        applicationId,
        { to_stage_id: targetStageId, reason: reason.trim() || undefined },
        currentStageIndex,
        targetStageIndex
      );

      if (result.success) {
        toast({
          title: 'Application moved',
          description: `${applicantName} moved to ${targetStage?.stageName}`,
          variant: 'success',
        });
        onClose();
        onSuccess?.();
      } else {
        toast({
          title: 'Failed to move application',
          description: result.error,
          variant: 'error',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-xl bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Move Stage</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            {/* Applicant Info */}
            <div>
              <p className="text-sm text-gray-500">Applicant</p>
              <p className="font-medium text-gray-900">{applicantName}</p>
            </div>

            {/* Current Stage */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Stage</p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                  {currentStage?.stageName || 'Unknown'}
                </span>
                <span className="text-xs text-gray-400">
                  ({currentStage?.stageType})
                </span>
              </div>
            </div>

            {/* Terminal Status Warning */}
            {isTerminal && (
              <div className="flex items-start gap-3 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Cannot move application
                  </p>
                  <p className="text-sm text-yellow-700">
                    This application has a terminal status and cannot be moved between stages.
                  </p>
                </div>
              </div>
            )}

            {/* Stage Selection */}
            {!isTerminal && (
              <>
                {adjacentStages.length === 0 ? (
                  <div className="text-sm text-gray-500 py-4 text-center">
                    No adjacent stages available for this application.
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Move to
                      </label>
                      <div className="space-y-2">
                        {adjacentStages.map((stage) => {
                          const isForward = stage.orderIndex > currentStageIndex;
                          return (
                            <label
                              key={stage.id}
                              className={`
                                flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                                ${targetStageId === stage.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                                }
                              `}
                            >
                              <input
                                type="radio"
                                name="targetStage"
                                value={stage.id}
                                checked={targetStageId === stage.id}
                                onChange={(e) => setTargetStageId(e.target.value)}
                                className="h-4 w-4 text-blue-600"
                                disabled={isSubmitting}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">
                                    {stage.stageName}
                                  </span>
                                  <ArrowRight
                                    className={`h-4 w-4 ${
                                      isForward ? 'text-green-500' : 'text-orange-500 rotate-180'
                                    }`}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">
                                  {stage.stageType} • {stage.conductedBy}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason (optional)
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Add a note about this stage change..."
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>
                  </>
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
            {!isTerminal && adjacentStages.length > 0 && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !targetStageId}
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Moving...
                  </>
                ) : (
                  'Move Application'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
