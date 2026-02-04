'use client';

import { Pencil, Trash2, AlertCircle } from 'lucide-react';
import type { TenantStatus } from '@/domain/tracking/statusSettings/schemas';

interface StatusSettingsTableProps {
  statuses: TenantStatus[];
  isAdmin: boolean;
  onEdit: (status: TenantStatus) => void;
  onDelete: (status: TenantStatus) => void;
}

export function StatusSettingsTable({
  statuses,
  isAdmin,
  onEdit,
  onDelete,
}: StatusSettingsTableProps) {
  // Sort statuses by sortOrder
  const sortedStatuses = [...statuses].sort((a, b) => a.sortOrder - b.sortOrder);

  if (sortedStatuses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No statuses configured</h3>
        <p className="text-gray-500 max-w-sm">
          {isAdmin
            ? 'Get started by adding your first application status.'
            : 'Contact an administrator to configure application statuses.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
            >
              Order
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Display Name
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status Code
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
            >
              Color
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
            >
              Terminal
            </th>
            {isAdmin && (
              <th
                scope="col"
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedStatuses.map((status) => (
            <tr key={status.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {status.sortOrder}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-900">
                  {status.displayName}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <code className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                  {status.statusCode}
                </code>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: status.colorHex }}
                    title={status.colorHex}
                  />
                  <span className="text-xs text-gray-500 font-mono">
                    {status.colorHex}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {status.isTerminal ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    No
                  </span>
                )}
              </td>
              {isAdmin && (
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(status)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit status"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(status)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete status"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
