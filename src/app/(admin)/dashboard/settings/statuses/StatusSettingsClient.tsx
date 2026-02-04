'use client';

import { useState, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { StatusSettingsTable } from '@/components/settings/StatusSettingsTable';
import { StatusEditModal } from '@/components/settings/StatusEditModal';
import { StatusDeleteConfirmModal } from '@/components/settings/StatusDeleteConfirmModal';
import { listTenantStatusesAction } from '@/lib/actions/tenantStatus';
import type { TenantStatus } from '@/domain/tracking/statusSettings/schemas';

interface StatusSettingsClientProps {
  initialStatuses: TenantStatus[];
  isAdmin: boolean;
}

export function StatusSettingsClient({
  initialStatuses,
  isAdmin,
}: StatusSettingsClientProps) {
  const [statuses, setStatuses] = useState<TenantStatus[]>(initialStatuses);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TenantStatus | null>(null);

  const refreshStatuses = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await listTenantStatusesAction();
      if (result.success) {
        setStatuses(result.data);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleAddClick = () => {
    setSelectedStatus(null);
    setIsEditModalOpen(true);
  };

  const handleEditClick = (status: TenantStatus) => {
    setSelectedStatus(status);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (status: TenantStatus) => {
    setSelectedStatus(status);
    setIsDeleteModalOpen(true);
  };

  const handleModalSuccess = () => {
    refreshStatuses();
  };

  const existingStatusCodes = statuses.map((s) => s.statusCode);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Application Statuses</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure the status options available for tracking applications through your hiring pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshStatuses}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {isAdmin && (
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Status
            </button>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800">About Application Statuses</h3>
        <p className="mt-1 text-sm text-blue-700">
          Statuses track where candidates are in your hiring process. Terminal statuses (like Hired or Rejected)
          indicate final decisions and prevent further stage movements.
        </p>
      </div>

      {/* Table */}
      <StatusSettingsTable
        statuses={statuses}
        isAdmin={isAdmin}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Modals */}
      <StatusEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        status={selectedStatus}
        onSuccess={handleModalSuccess}
        existingStatusCodes={existingStatusCodes}
      />

      <StatusDeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        status={selectedStatus}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
