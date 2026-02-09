'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { deleteJobAction, getCascadeInfoAction } from '@/lib/actions/job';
import type { Job, JobListItem, CascadeInfo } from '@/domain/jobs/schemas';
import { toast } from '@/components/ui/ToastProvider';

interface DeleteJobModalProps {
  job: Job | JobListItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Delete Job Modal Component
 * B5: Confirm job deletion with cascade warning
 */
export function DeleteJobModal({ job, isOpen, onClose, onSuccess }: DeleteJobModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [cascadeInfo, setCascadeInfo] = useState<CascadeInfo | null>(null);
  const [isLoadingCascade, setIsLoadingCascade] = useState(false);

  /**
   * Load cascade information when modal opens
   */
  useEffect(() => {
    if (isOpen) {
      loadCascadeInfo();
    }
    // loadCascadeInfo is intentionally excluded from dependencies as it's defined below
    // and would cause infinite loops if included. It only depends on job.id which is already tracked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, job.id]);

  const loadCascadeInfo = async () => {
    setIsLoadingCascade(true);
    try {
      const result = await getCascadeInfoAction(job.id);
      if (result.success) {
        setCascadeInfo(result.data);
      }
    } catch (error) {
      console.error('Failed to load cascade info:', error);
      // Continue with default values
      setCascadeInfo({ jobId: '', applicationCount: 0 });
    } finally {
      setIsLoadingCascade(false);
    }
  };

  /**
   * Handle job deletion
   */
  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteJobAction(job.id);

      if (result.success) {
        // Show success toast
        toast({
          title: 'Job deleted successfully',
          description: `${job.title} has been permanently deleted.`,
          variant: 'success',
        });

        // Close modal
        onClose();

        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        } else {
          // Default: redirect to jobs list
          router.push('/dashboard/jobs');
        }
      } else {
        const isFkConstraint =
          result.error?.toLowerCase().includes('foreign key') ||
          result.error?.toLowerCase().includes('constraint') ||
          result.error?.toLowerCase().includes('cannot delete') ||
          result.code === 'FK_CONSTRAINT';

        toast({
          title: 'Failed to delete job',
          description: isFkConstraint
            ? 'This job has active applications. Remove all applications before deleting.'
            : result.error,
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

  const hasCascadeItems = cascadeInfo && cascadeInfo.applicationCount > 0;

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
                <h2 className="text-lg font-semibold text-gray-900">Delete Job</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Are you sure you want to delete this job?
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
            {/* Job Info */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="font-semibold text-gray-900">{job.title}</h3>
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
                {'department' in job && job.department && <span>{job.department}</span>}
                {'location' in job && job.location && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span>{job.location}</span>
                  </>
                )}
              </div>
            </div>

            {/* Warning Message */}
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-900">
                This action cannot be undone
              </p>
              <p className="mt-1 text-sm text-red-700">
                Deleting this job will permanently remove it and all associated data from the
                system.
              </p>
            </div>

            {/* Cascade Information */}
            {isLoadingCascade ? (
              <div className="mt-4 flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">
                  Checking related data...
                </span>
              </div>
            ) : hasCascadeItems ? (
              <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm font-semibold text-orange-900">
                  The following items will also be deleted:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-orange-700">
                  <li>
                    • {cascadeInfo.applicationCount} application
                    {cascadeInfo.applicationCount > 1 ? 's' : ''}
                  </li>
                </ul>
              </div>
            ) : cascadeInfo ? (
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                  No applications or interviews associated with this job.
                </p>
              </div>
            ) : null}
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
                'Delete Job'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
