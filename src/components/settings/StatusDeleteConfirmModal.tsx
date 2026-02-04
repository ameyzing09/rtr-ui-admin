'use client';

import { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/ToastProvider';
import { deleteTenantStatusAction } from '@/lib/actions/tenantStatus';
import type { TenantStatus } from '@/domain/tracking/statusSettings/schemas';

interface StatusDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: TenantStatus | null;
  onSuccess: () => void;
}

export function StatusDeleteConfirmModal({
  isOpen,
  onClose,
  status,
  onSuccess,
}: StatusDeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!status) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteTenantStatusAction(status.id);

      if (result.success) {
        toast({
          title: 'Status deleted',
          description: `${status.displayName} has been removed`,
          variant: 'success',
        });
        onClose();
        onSuccess();
      } else {
        // Handle specific error codes
        if (result.code === 'STATUS_IN_USE') {
          setError('Cannot delete this status because it is currently being used by applications. Please reassign those applications to a different status first.');
        } else {
          setError(result.error || 'Failed to delete status');
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !status) return null;

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
              Delete Status
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
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete the status{' '}
                  <span className="font-semibold text-gray-900">
                    {status.displayName}
                  </span>
                  ?
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  This action cannot be undone. Applications currently using this status will need to be reassigned.
                </p>
              </div>
            </div>

            {/* Status Preview */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded border border-gray-300"
                  style={{ backgroundColor: status.colorHex }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{status.displayName}</p>
                  <p className="text-xs text-gray-500 font-mono">{status.statusCode}</p>
                </div>
                {status.isTerminal && (
                  <span className="ml-auto text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded">
                    Terminal
                  </span>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Status'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
