'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

import Button from '@/components/atoms/Button';
import { type TenantListItem } from '@/lib/schemas/tenant';

export interface DeleteTenantModalProps {
  tenant: TenantListItem | null;
  isOpen: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: (tenantId: string) => Promise<void>;
}

export default function DeleteTenantModal({
  tenant,
  isOpen,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteTenantModalProps) {
  if (!isOpen || !tenant) return null;

  const handleConfirm = async () => {
    await onConfirm(tenant.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-md mx-4 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-[var(--app-fg)]">
                  Delete Tenant
                </h2>
              </div>
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="p-1 hover:bg-[var(--muted)] rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-[var(--muted-foreground)]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-[var(--muted-foreground)] mb-4">
                Are you sure you want to delete the tenant <strong className="text-[var(--app-fg)]">&ldquo;{tenant.name}&rdquo;</strong>?
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-red-800 mb-1">
                      This action cannot be undone
                    </h4>
                    <ul className="text-xs text-red-700 space-y-1">
                      <li>• All tenant data will be permanently deleted</li>
                      <li>• Users will lose access immediately</li>
                      <li>• Billing and subscription will be cancelled</li>
                      <li>• Domain: <code className="bg-red-100 px-1 rounded">{tenant.domain}</code></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--muted)] rounded-lg p-3 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-[var(--muted-foreground)]">Status:</span>
                  <span className="text-[var(--app-fg)]">{tenant.status}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-[var(--muted-foreground)]">Plan:</span>
                  <span className="text-[var(--app-fg)]">{tenant.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Created:</span>
                  <span className="text-[var(--app-fg)]">
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }).format(tenant.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-[var(--border)]">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirm}
                isLoading={isDeleting}
                disabled={isDeleting}
                icon={isDeleting ? undefined : Trash2}
                className="flex-1"
              >
                {isDeleting ? 'Deleting...' : 'Delete Tenant'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}