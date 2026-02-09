'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  Mail,
  Clock,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { getTrackingStateAction } from '@/lib/actions/tracking';
import { TrackingStatusBadge } from './TrackingStatusBadge';
import { ActionModal } from './ActionModal';
import { StageHistoryContent } from './StageHistoryPanel';
import type { TrackingState } from '@/domain/tracking/schemas';

type TabType = 'details' | 'history';

interface ApplicationDetailDrawerProps {
  applicationId: string | null;
  applicantName?: string;
  applicantEmail?: string;
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
  isOpen,
  onClose,
  onUpdate,
  canEdit = true,
}: ApplicationDetailDrawerProps) {
  const [trackingState, setTrackingState] = useState<TrackingState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('details');

  useEffect(() => {
    if (isOpen && applicationId) {
      loadTrackingState();
      setActiveTab('details'); // Reset to details tab when drawer opens
    }
  }, [isOpen, applicationId]);

  const loadTrackingState = async () => {
    if (!applicationId) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await getTrackingStateAction(applicationId);
      if (result.success) {
        setTrackingState(result.data);
      } else {
        // Show detailed error info
        const errorDetails = result.fieldErrors
          ? JSON.stringify(result.fieldErrors)
          : '';
        setError(`${result.error || 'Failed to load tracking state'}${errorDetails ? ` - ${errorDetails}` : ''}`);
      }
    } catch (error) {
      console.error('Failed to load tracking state:', error);
      setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = () => {
    loadTrackingState();
    onUpdate?.();
  };

  if (!isOpen) return null;

  const isTerminal = trackingState?.isTerminal ?? false;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer - Slide in from right */}
      <div className="fixed inset-y-0 right-0 z-[60] w-full max-w-lg bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
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

          {/* Tabs */}
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' ? (
            // Details Tab Content
            isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : error ? (
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

                {/* Error State */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                  <button
                    onClick={loadTrackingState}
                    className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                  >
                    Try again
                  </button>
                </div>
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
                        <TrackingStatusBadge
                          status={trackingState.status}
                          outcomeType={trackingState.outcomeType}
                          size="md"
                        />
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

                        {/* Take Action */}
                        <button
                          data-testid="take-action-btn"
                          onClick={() => setShowActionModal(true)}
                          disabled={isTerminal}
                          className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Zap className="h-5 w-5 text-gray-400" />
                          <div className="text-left">
                            <div className="font-medium text-gray-900">
                              Take Action
                            </div>
                            <div className="text-sm text-gray-500">
                              {isTerminal
                                ? 'Application has been finalized'
                                : 'Advance, hold, reject, or take other actions'}
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
            )
          ) : (
            // History Tab Content
            applicationId && <StageHistoryContent applicationId={applicationId} />
          )}
        </div>
      </div>

      {/* Action Modal */}
      {trackingState && applicationId && (
        <ActionModal
          isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          applicationId={applicationId}
          applicantName={applicantName}
          currentStatus={trackingState?.status}
          currentStageName={trackingState?.currentStageName}
          currentOutcomeType={trackingState?.outcomeType}
          isTerminal={trackingState?.isTerminal}
          onSuccess={handleUpdate}
        />
      )}
    </>
  );
}
