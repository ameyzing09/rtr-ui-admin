'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/ToastProvider';
import { createTenantStatusAction, updateTenantStatusAction } from '@/lib/actions/tenantStatus';
import { normalizeColorHex } from '@/domain/tracking/statusSettings/schemas';
import type { TenantStatus } from '@/domain/tracking/statusSettings/schemas';

interface StatusEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: TenantStatus | null; // null = create mode, TenantStatus = edit mode
  onSuccess: () => void;
  existingStatusCodes: string[];
}

export function StatusEditModal({
  isOpen,
  onClose,
  status,
  onSuccess,
  existingStatusCodes,
}: StatusEditModalProps) {
  const isEditMode = status !== null;

  const [statusCode, setStatusCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [colorHex, setColorHex] = useState('#3b82f6');
  const [isTerminal, setIsTerminal] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or status changes
  useEffect(() => {
    if (isOpen) {
      if (status) {
        setStatusCode(status.statusCode);
        setDisplayName(status.displayName);
        setColorHex(normalizeColorHex(status.colorHex));
        setIsTerminal(status.isTerminal);
        setSortOrder(status.sortOrder);
      } else {
        setStatusCode('');
        setDisplayName('');
        setColorHex('#3b82f6');
        setIsTerminal(false);
        setSortOrder(existingStatusCodes.length * 10);
      }
      setErrors({});
    }
  }, [isOpen, status, existingStatusCodes.length]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isEditMode) {
      if (!statusCode.trim()) {
        newErrors.statusCode = 'Status code is required';
      } else if (!/^[A-Z_]+$/.test(statusCode.trim())) {
        newErrors.statusCode = 'Status code must be uppercase letters and underscores only';
      } else if (existingStatusCodes.includes(statusCode.trim().toUpperCase())) {
        newErrors.statusCode = 'Status code already exists';
      }
    }

    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!colorHex || !/^#[0-9A-Fa-f]{6}$/.test(colorHex)) {
      newErrors.colorHex = 'Invalid color format';
    }

    if (sortOrder < 0) {
      newErrors.sortOrder = 'Sort order must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isEditMode && status) {
        const result = await updateTenantStatusAction(status.id, {
          display_name: displayName.trim(),
          color_hex: normalizeColorHex(colorHex),
          is_terminal: isTerminal,
          sort_order: sortOrder,
        });

        if (result.success) {
          toast({
            title: 'Status updated',
            description: `${displayName} has been updated`,
            variant: 'success',
          });
          onClose();
          onSuccess();
        } else {
          handleApiError(result.error, result.code);
        }
      } else {
        const result = await createTenantStatusAction({
          status_code: statusCode.trim().toUpperCase(),
          display_name: displayName.trim(),
          color_hex: normalizeColorHex(colorHex),
          is_terminal: isTerminal,
          sort_order: sortOrder,
        });

        if (result.success) {
          toast({
            title: 'Status created',
            description: `${displayName} has been added`,
            variant: 'success',
          });
          onClose();
          onSuccess();
        } else {
          handleApiError(result.error, result.code);
        }
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

  const handleApiError = (error: string, code?: string) => {
    if (code === '23505' || error.toLowerCase().includes('already exists')) {
      setErrors({ statusCode: 'Status code already exists' });
    } else if (code === 'TERMINAL_STATUS_LOCKED') {
      setErrors({ isTerminal: 'Cannot modify terminal status setting - applications exist' });
    } else {
      toast({
        title: 'Failed to save status',
        description: error,
        variant: 'error',
      });
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
              {isEditMode ? 'Edit Status' : 'Add Status'}
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
            {/* Status Code (create only) */}
            {!isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={statusCode}
                  onChange={(e) => setStatusCode(e.target.value.toUpperCase())}
                  placeholder="e.g., PENDING_REVIEW"
                  className={`w-full rounded-lg border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 ${
                    errors.statusCode
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.statusCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.statusCode}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Uppercase letters and underscores only. Cannot be changed after creation.
                </p>
              </div>
            )}

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., Pending Review"
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  errors.displayName
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                disabled={isSubmitting}
              />
              {errors.displayName && (
                <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
              )}
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(normalizeColorHex(e.target.value))}
                  className="h-10 w-14 cursor-pointer rounded border border-gray-300 p-1"
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  placeholder="#3b82f6"
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 ${
                    errors.colorHex
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.colorHex && (
                <p className="mt-1 text-sm text-red-600">{errors.colorHex}</p>
              )}
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                min="0"
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  errors.sortOrder
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                disabled={isSubmitting}
              />
              {errors.sortOrder && (
                <p className="mt-1 text-sm text-red-600">{errors.sortOrder}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Lower numbers appear first in the list.
              </p>
            </div>

            {/* Terminal Toggle */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Terminal Status
                </label>
                <button
                  type="button"
                  onClick={() => setIsTerminal(!isTerminal)}
                  disabled={isSubmitting}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isTerminal ? 'bg-blue-600' : 'bg-gray-200'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isTerminal ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {errors.isTerminal && (
                <p className="mt-1 text-sm text-red-600">{errors.isTerminal}</p>
              )}
            </div>

            {/* Terminal Warning */}
            {isTerminal && (
              <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Terminal status
                  </p>
                  <p className="text-sm text-amber-700">
                    Applications with this status cannot be moved between stages or have their status changed.
                  </p>
                </div>
              </div>
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
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  {isEditMode ? 'Saving...' : 'Creating...'}
                </>
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Create Status'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
