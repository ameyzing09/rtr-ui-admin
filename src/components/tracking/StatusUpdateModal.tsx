'use client';

import { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { updateStatusAction } from '@/lib/actions/tracking';
import { TrackingStatusBadge } from './TrackingStatusBadge';
import { toast } from '@/components/ui/ToastProvider';
import type { TrackingStatus } from '@/domain/tracking/schemas';
import {
  TERMINAL_STATUSES,
  isTerminalStatus,
  getTrackingStatusLabel,
} from '@/domain/tracking/schemas';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  currentStatus: TrackingStatus;
  applicantName: string;
  onSuccess?: () => void;
}

const ALL_STATUSES: TrackingStatus[] = [
  'ACTIVE',
  'ON_HOLD',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
];

export function StatusUpdateModal({
  isOpen,
  onClose,
  applicationId,
  currentStatus,
  applicantName,
  onSuccess,
}: StatusUpdateModalProps) {
  const [newStatus, setNewStatus] = useState<TrackingStatus>(currentStatus);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out current status from options
  const availableStatuses = ALL_STATUSES.filter((s) => s !== currentStatus);

  // Check if new status is terminal
  const isNewStatusTerminal = isTerminalStatus(newStatus);

  // Check if current status is terminal (can't change)
  const isCurrentTerminal = isTerminalStatus(currentStatus);

  const handleSubmit = async () => {
    if (newStatus === currentStatus) return;

    setIsSubmitting(true);

    try {
      const result = await updateStatusAction(applicationId, {
        status: newStatus,
        reason: reason.trim() || undefined,
      });

      if (result.success) {
        toast({
          title: 'Status updated',
          description: `${applicantName}'s status changed to ${getTrackingStatusLabel(newStatus)}`,
          variant: 'success',
        });
        onClose();
        onSuccess?.();
      } else {
        toast({
          title: 'Failed to update status',
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
            <h2 className="text-lg font-semibold text-gray-900">
              Update Status
            </h2>
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

            {/* Current Status */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Status</p>
              <TrackingStatusBadge status={currentStatus} size="md" />
            </div>

            {/* Terminal Status Warning */}
            {isCurrentTerminal && (
              <div className="flex items-start gap-3 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Cannot change status
                  </p>
                  <p className="text-sm text-yellow-700">
                    This application has a terminal status and cannot be modified.
                  </p>
                </div>
              </div>
            )}

            {/* New Status Select */}
            {!isCurrentTerminal && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TrackingStatus)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={isSubmitting}
                  >
                    <option value={currentStatus} disabled>
                      Select new status...
                    </option>
                    {availableStatuses.map((status) => (
                      <option key={status} value={status}>
                        {getTrackingStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Terminal Warning */}
                {isNewStatusTerminal && newStatus !== currentStatus && (
                  <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        This is a final decision
                      </p>
                      <p className="text-sm text-red-700">
                        Once set to {getTrackingStatusLabel(newStatus)}, the application
                        cannot be moved between stages and the status cannot be changed.
                      </p>
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason (optional)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Add a note about this status change..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                </div>
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
            {!isCurrentTerminal && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || newStatus === currentStatus}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg
                  ${isNewStatusTerminal
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
