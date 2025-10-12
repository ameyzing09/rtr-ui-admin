'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Activity,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { SkeletonTable } from '@/components/ui/Skeleton';
import { useToastMessages } from '@/components/ui/ToastProvider';
import DeleteTenantModal from '@/components/tenants/DeleteTenantModal';

import {
  type TenantListItem,
  type TenantStatus,
  type Plan
} from '@/domain/tenants/schemas';
import { formatRelativeTime } from '@/lib/utils/date';

export interface TenantTableProps {
  tenants: TenantListItem[];
  isLoading?: boolean;
  onDelete?: (tenantId: string) => Promise<void>;
  onStatusClick?: (tenantId: string) => void;
  className?: string;
}

interface TenantRowActionProps {
  tenant: TenantListItem;
  onDelete?: (tenantId: string) => Promise<void>;
  onStatusClick?: (tenantId: string) => void;
}

function TenantRowActions({ tenant, onDelete, onStatusClick }: TenantRowActionProps) {
  const router = useRouter();
  const toast = useToastMessages();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = useCallback(() => {
    setShowActions(false);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(async (tenantId: string) => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(tenantId);
      toast.success('Tenant deleted', 'The tenant has been successfully deleted.');
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Failed to delete tenant', error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsDeleting(false);
    }
  }, [onDelete, toast]);

  const handleView = useCallback(() => {
    setShowActions(false);
    router.push(`/sa/tenants/${tenant.id}`);
  }, [router, tenant.id]);

  const handleEdit = useCallback(() => {
    setShowActions(false);
    router.push(`/sa/tenants/${tenant.id}/edit`);
  }, [router, tenant.id]);

  const handleStatus = useCallback(() => {
    setShowActions(false);
    if (onStatusClick) {
      onStatusClick(tenant.id);
    } else {
      router.push(`/sa/tenants/${tenant.id}?tab=status`);
    }
  }, [onStatusClick, router, tenant.id]);

  const toggleActions = useCallback(() => {
    setShowActions(prev => !prev);
  }, []);

  const closeActions = useCallback(() => {
    setShowActions(false);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={toggleActions}
        className={`
          relative inline-flex items-center justify-center w-9 h-9 rounded-lg
          border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]
          text-[var(--muted-foreground)] hover:text-[var(--app-fg)]
          transition-all duration-200 ease-in-out
          hover:shadow-sm hover:border-[var(--muted-foreground)]/20
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30
          ${showActions ? 'bg-[var(--muted)] text-[var(--app-fg)] border-[var(--muted-foreground)]/30 shadow-sm' : ''}
        `}
        title="More actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      
      <AnimatePresence>
        {showActions && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={closeActions}
            />
            
            {/* Actions menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="
                absolute right-0 top-full mt-2 w-48 
                bg-[var(--card)] border border-[var(--border)] 
                rounded-xl shadow-xl z-20 py-2
                backdrop-blur-sm 
                ring-1 ring-black/5 dark:ring-white/10
              "
            >
              <button
                onClick={handleView}
                className="
                  flex items-center gap-3 w-full px-4 py-2.5 text-sm 
                  text-[var(--app-fg)] hover:bg-[var(--muted)] 
                  transition-colors duration-150 rounded-lg mx-1
                  hover:text-blue-600 dark:hover:text-blue-400
                "
              >
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="font-medium">View Details</span>
              </button>
              
              <button
                onClick={handleEdit}
                className="
                  flex items-center gap-3 w-full px-4 py-2.5 text-sm 
                  text-[var(--app-fg)] hover:bg-[var(--muted)] 
                  transition-colors duration-150 rounded-lg mx-1
                  hover:text-amber-600 dark:hover:text-amber-400
                "
              >
                <Edit className="w-4 h-4 text-amber-500" />
                <span className="font-medium">Edit Tenant</span>
              </button>
              
              <button
                onClick={handleStatus}
                className="
                  flex items-center gap-3 w-full px-4 py-2.5 text-sm 
                  text-[var(--app-fg)] hover:bg-[var(--muted)] 
                  transition-colors duration-150 rounded-lg mx-1
                  hover:text-green-600 dark:hover:text-green-400
                "
              >
                <Activity className="w-4 h-4 text-green-500" />
                <span className="font-medium">View Status</span>
              </button>
              
              <div className="border-t border-[var(--border)] my-2 mx-2" />
              
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="
                  flex items-center gap-3 w-full px-4 py-2.5 text-sm 
                  text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 
                  transition-colors duration-150 rounded-lg mx-1
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:text-red-700 dark:hover:text-red-400
                "
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span className="font-medium">Delete Tenant</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <DeleteTenantModal
        tenant={tenant}
        isOpen={showDeleteModal}
        isDeleting={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

function getStatusIcon(status: TenantStatus) {
  switch (status) {
    case 'ACTIVE':
      return <CheckCircle className="w-4 h-4" />;
    case 'PENDING':
    case 'PROVISIONING':
    case 'AWAITING_BRANDING':
      return <Clock className="w-4 h-4" />;
    case 'FAILED':
      return <XCircle className="w-4 h-4" />;
    case 'SUSPENDED':
    case 'TERMINATED':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function getStatusColor(status: TenantStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'text-green-700 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800';
    case 'PENDING':
      return 'text-yellow-700 bg-yellow-100 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-800';
    case 'PROVISIONING':
      return 'text-blue-700 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800';
    case 'AWAITING_BRANDING':
      return 'text-purple-700 bg-purple-100 border-purple-200 dark:text-purple-400 dark:bg-purple-900/30 dark:border-purple-800';
    case 'FAILED':
      return 'text-red-700 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800';
    case 'SUSPENDED':
      return 'text-orange-700 bg-orange-100 border-orange-200 dark:text-orange-400 dark:bg-orange-900/30 dark:border-orange-800';
    case 'TERMINATED':
      return 'text-gray-700 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-900/30 dark:border-gray-800';
    default:
      return 'text-gray-700 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-900/30 dark:border-gray-800';
  }
}

function getPlanColor(plan: Plan): string {
  switch (plan) {
    case 'ENTERPRISE':
      return 'text-purple-700 bg-purple-100 border-purple-200 dark:text-purple-400 dark:bg-purple-900/30 dark:border-purple-800';
    case 'GROWTH':
      return 'text-blue-700 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800';
    case 'STARTER':
      return 'text-green-700 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800';
    case 'BASIC':
      return 'text-gray-700 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-900/30 dark:border-gray-800';
    case 'ON_PREM':
      return 'text-orange-700 bg-orange-100 border-orange-200 dark:text-orange-400 dark:bg-orange-900/30 dark:border-orange-800';
    default:
      return 'text-gray-700 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-900/30 dark:border-gray-800';
  }
}


export default function TenantTable({
  tenants,
  isLoading = false,
  onDelete,
  onStatusClick,
  className = '',
}: TenantTableProps) {
  if (isLoading) {
    return (
      <div className={`bg-[var(--card)] border border-[var(--border)] rounded-lg ${className}`}>
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--muted-foreground)]" />
            <span className="font-medium text-[var(--app-fg)]">Loading tenants...</span>
          </div>
        </div>
        <div className="p-6">
          <SkeletonTable rows={8} columns={4} />
        </div>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className={`bg-[var(--card)] border border-[var(--border)] rounded-lg ${className}`}>
        <div className="p-12 text-center">
          <Users className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--app-fg)] mb-2">
            No tenants found
          </h3>
          <p className="text-[var(--muted-foreground)]">
            No tenants match your current filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[var(--muted-foreground)]" />
          <span className="font-medium text-[var(--app-fg)]">
            {tenants.length} tenant{tenants.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--muted)]/50">
            <tr>
              <th className="text-left py-3 px-6 font-medium text-[var(--muted-foreground)] text-sm">
                Tenant
              </th>
              <th className="text-left py-3 px-6 font-medium text-[var(--muted-foreground)] text-sm">
                Status
              </th>
              <th className="text-left py-3 px-6 font-medium text-[var(--muted-foreground)] text-sm">
                Plan
              </th>
              <th className="text-left py-3 px-6 font-medium text-[var(--muted-foreground)] text-sm">
                Created
              </th>
              <th className="text-center py-3 px-6 font-medium text-[var(--muted-foreground)] text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {tenants.map((tenant) => (
                <motion.tr
                  key={tenant.id}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--app-fg)] truncate">
                        {tenant.name}
                      </span>
                      <div className="flex flex-col gap-1 text-sm text-[var(--muted-foreground)]">
                        <span>{tenant.domain}</span>
                        {tenant.admin_email && (
                          <span>{tenant.admin_email}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <span className={`
                      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                      ${getStatusColor(tenant.status)}
                    `}>
                      {getStatusIcon(tenant.status)}
                      {tenant.status.replace('_', ' ')}
                    </span>
                  </td>
                  
                  <td className="py-4 px-6">
                    <span className={`
                      inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                      ${getPlanColor(tenant.plan)}
                    `}>
                      {tenant.plan}
                    </span>
                  </td>
                  
                  <td className="py-4 px-6 text-sm text-[var(--muted-foreground)]">
                    {formatRelativeTime(tenant.created_at)}
                  </td>
                  
                  <td className="py-4 px-6 text-center">
                    <TenantRowActions
                      tenant={tenant}
                      onDelete={onDelete}
                      onStatusClick={onStatusClick}
                    />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}