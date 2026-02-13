import { redirect } from 'next/navigation';
import { getSession, hasPermission } from '@/lib/rbac/guard.server';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import { listMembersAction } from '@/lib/actions/members';
import MembersClient from './MembersClient';

export const metadata = {
  title: 'Team Members | Dashboard',
  description: 'Manage your team members and their roles',
};

export default async function TeamMembersPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Check for member list permission
  const canList = await hasPermission(PERMISSIONS.MEMBER_LIST, session);
  if (!canList) {
    redirect('/unauthorized?reason=permission&required=member:list');
  }

  // Determine capabilities
  const canCreate = await hasPermission(PERMISSIONS.MEMBER_CREATE, session);
  const canUpdate = await hasPermission(PERMISSIONS.MEMBER_UPDATE, session);
  const canResetPassword = await hasPermission(PERMISSIONS.MEMBER_RESET_PASSWORD, session);

  // Fetch initial data
  const membersResult = await listMembersAction();

  if (!membersResult.success) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <h2 className="text-lg font-semibold text-red-800">Error loading members</h2>
          <p className="mt-1 text-sm text-red-700">{membersResult.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <MembersClient
        initialMembers={membersResult.data}
        currentUserId={session.userId}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canResetPassword={canResetPassword}
      />
    </div>
  );
}
