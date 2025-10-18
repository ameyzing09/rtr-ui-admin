'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { deleteApplicationAction } from '@/lib/actions/application';
import type { Application } from '@/domain/applications/schemas';
import { toast } from '@/components/ui/ToastProvider';

interface DeleteApplicationModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Delete Application Modal Component
 * C3: Confirm application deletion
 */
export function DeleteApplicationModal({
  application,
  isOpen,
  onClose,
  onSuccess,
}: DeleteApplicationModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handle application deletion
   */
  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteApplicationAction(application.id);

      if (result.success) {
        // Show success toast
        toast({
          title: 'Application deleted successfully',
          description: `Application from ${application.applicantName} has been permanently deleted.`,
          variant: 'success',
        });

        // Close modal
        onClose();

        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        } else {
          // Default: refresh the page
          router.refresh();
        }
      } else {
        // Show error toast
        toast({
          title: 'Failed to delete application',
          description: result.error,
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'error',
      });
    } finally {
      setIsDeleting(false);
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
          className="relative w-full max-w-lg rounded-lg bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delete Application</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Are you sure you want to delete this application?
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Application Info */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="font-semibold text-gray-900">{application.applicantName}</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <div>{application.applicantEmail}</div>
                {application.applicantPhone && <div>{application.applicantPhone}</div>}
              </div>
            </div>

            {/* Warning Message */}
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-900">
                This action cannot be undone
              </p>
              <p className="mt-1 text-sm text-red-700">
                Deleting this application will permanently remove it from the system.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Application'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
