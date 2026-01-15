'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  Mail,
  Clock,
  ArrowRight,
  History,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { getTrackingStateAction } from '@/lib/actions/tracking';
import { TrackingStatusBadge } from './TrackingStatusBadge';
import { StatusUpdateModal } from './StatusUpdateModal';
import { MoveStageModal } from './MoveStageModal';
import { StageHistoryPanel } from './StageHistoryPanel';
import type { TrackingState, PipelineStage } from '@/domain/tracking/schemas';
import { isTerminalStatus } from '@/domain/tracking/schemas';

interface ApplicationDetailDrawerProps {
  applicationId: string | null;
  applicantName?: string;
  applicantEmail?: string;
  pipelineStages: PipelineStage[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  canEdit?: boolean;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function ApplicationDetailDrawer({
  applicationId,
  applicantName = 'Unknown',
  applicantEmail = '',
  pipelineStages,
  isOpen,
  onClose,
  onUpdate,
  canEdit = true,
}: ApplicationDetailDrawerProps) {
  const [trackingState, setTrackingState] = useState<TrackingState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  useEffect(() => {
    if (isOpen && applicationId) {
      loadTrackingState();
    }
  }, [isOpen, applicationId]);

  const loadTrackingState = async () => {
    if (!applicationId) return;

    setIsLoading(true);
    try {
      const result = await getTrackingStateAction(applicationId);
      if (result.success) {
        setTrackingState(result.data);
      }
    } catch (error) {
      console.error('Failed to load tracking state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = () => {
    loadTrackingState();
    onUpdate?.();
  };

  if (!isOpen) return null;

  const isTerminal = trackingState ? isTerminalStatus(trackingState.status) : false;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer - Slide in from right */}
      <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Application Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Applicant Info */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {applicantName}
                </h3>
                {applicantEmail && (
                  <div className="flex items-center gap-2 mt-1 text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>{applicantEmail}</span>
                  </div>
                )}
              </div>

              {/* Tracking State */}
              {trackingState && (
                <>
                  {/* Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Status
                      </span>
                      <TrackingStatusBadge status={trackingState.status} size="md" />
                    </div>

                    {/* Current Stage */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Current Stage
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                        {trackingState.currentStageName}
                      </span>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Entered stage:</span>
                      <span className="text-gray-900">
                        {formatDate(trackingState.enteredStageAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Created:</span>
                      <span className="text-gray-900">
                        {formatDate(trackingState.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {canEdit && (
                    <div className="border-t border-gray-200 pt-6 space-y-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Actions
                      </h4>

                      {/* Update Status */}
                      <button
                        onClick={() => setShowStatusModal(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Edit className="h-5 w-5 text-gray-400" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            Update Status
                          </div>
                          <div className="text-sm text-gray-500">
                            Change to Hired, Rejected, etc.
                          </div>
                        </div>
                      </button>

                      {/* Move Stage */}
                      <button
                        onClick={() => setShowMoveModal(true)}
                        disabled={isTerminal}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            Move Stage
                          </div>
                          <div className="text-sm text-gray-500">
                            {isTerminal
                              ? 'Not available for terminal status'
                              : 'Move to adjacent pipeline stage'}
                          </div>
                        </div>
                      </button>

                      {/* View History */}
                      <button
                        onClick={() => setShowHistoryPanel(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <History className="h-5 w-5 text-gray-400" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            View History
                          </div>
                          <div className="text-sm text-gray-500">
                            See all stage transitions
                          </div>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Link to full application */}
                  <div className="border-t border-gray-200 pt-6">
                    <a
                      href={`/dashboard/applications/${applicationId}`}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View full application details
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {trackingState && applicationId && (
        <>
          <StatusUpdateModal
            isOpen={showStatusModal}
            onClose={() => setShowStatusModal(false)}
            applicationId={applicationId}
            currentStatus={trackingState.status}
            applicantName={applicantName}
            onSuccess={handleUpdate}
          />

          <MoveStageModal
            isOpen={showMoveModal}
            onClose={() => setShowMoveModal(false)}
            applicationId={applicationId}
            applicantName={applicantName}
            currentStageId={trackingState.currentStageId}
            currentStageIndex={trackingState.currentStageIndex}
            pipelineStages={pipelineStages}
            isTerminal={isTerminal}
            onSuccess={handleUpdate}
          />

          <StageHistoryPanel
            applicationId={applicationId}
            isOpen={showHistoryPanel}
            onClose={() => setShowHistoryPanel(false)}
          />
        </>
      )}
    </>
  );
}
