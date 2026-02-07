import { redirect } from 'next/navigation';
import { getSession, hasPermission } from '@/lib/rbac/guard.server';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { listStageActionsAction, listRoleCapabilitiesAction } from '@/lib/actions/actionSettings';
import { ActionSettingsClient } from './ActionSettingsClient';

export const metadata = {
  title: 'Stage Actions | Settings',
  description: 'View stage action configuration for your hiring pipeline',
};

export default async function ActionSettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Check for settings read permission
  const canReadSettings = await hasPermission(PERMISSIONS.SETTINGS_READ, session);
  if (!canReadSettings) {
    redirect('/unauthorized?reason=permission&required=settings:read');
  }

  // Fetch data in parallel
  const [actionsResult, capabilitiesResult] = await Promise.all([
    listStageActionsAction(),
    listRoleCapabilitiesAction(),
  ]);

  if (!actionsResult.success) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <h2 className="text-lg font-semibold text-red-800">Error loading stage actions</h2>
          <p className="mt-1 text-sm text-red-700">{actionsResult.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ActionSettingsClient
        actions={actionsResult.data}
        capabilities={capabilitiesResult.success ? capabilitiesResult.data : []}
      />
    </div>
  );
}
