import { redirect } from 'next/navigation';
import { getSession, hasPermission } from '@/lib/rbac/guard.server';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { listTenantStatusesAction } from '@/lib/actions/tenantStatus';
import { StatusSettingsClient } from './StatusSettingsClient';

export const metadata = {
  title: 'Application Statuses | Settings',
  description: 'Configure application status options for your hiring pipeline',
};

export default async function StatusSettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Check for settings read permission
  const canReadSettings = await hasPermission(PERMISSIONS.SETTINGS_READ, session);
  if (!canReadSettings) {
    redirect('/unauthorized?reason=permission&required=settings:read');
  }

  // Check if user is admin (can modify statuses)
  const isAdmin = await hasPermission(PERMISSIONS.SETTINGS_UPDATE, session);

  // Fetch initial statuses
  const statusesResult = await listTenantStatusesAction();

  if (!statusesResult.success) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <h2 className="text-lg font-semibold text-red-800">Error loading statuses</h2>
          <p className="mt-1 text-sm text-red-700">{statusesResult.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <StatusSettingsClient
        initialStatuses={statusesResult.data}
        isAdmin={isAdmin}
      />
    </div>
  );
}
