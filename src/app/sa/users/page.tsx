import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/atoms/Button';
import { protectSuperadminRoute } from '@/lib/rbac/guard.server';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import UsersListClient from './UsersListClient';

/**
 * Users Management Page
 *
 * Superadmin page to view all users across all tenants and manage their passwords.
 * This page is server-side protected and requires superadmin role.
 */
export const metadata = {
  title: 'Users Management',
  description: 'Manage users across all tenants',
};

export default async function UsersPage() {
  // Protect route - requires SUPERADMIN role and SYS_USER_LIST permission
  await protectSuperadminRoute(PERMISSIONS.SYS_USER_LIST);

  return (
    <div className="p-8 space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Link href="/sa/tenants">
          <Button variant="ghost" icon={ArrowLeft} size="sm">
            Back
          </Button>
        </Link>
      </div>

      {/* Client Component */}
      <UsersListClient />
    </div>
  );
}
