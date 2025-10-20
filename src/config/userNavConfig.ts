import type { Permission } from '@/lib/rbac/permissions';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import type { UserRole } from '@/lib/auth/types';

export type UserNavLink = {
  id: string;
  label: string;
  href: string;
  icon?: 'dashboard' | 'notifications' | 'settings' | 'help';
  match?: 'exact' | 'startsWith';
  permissions?: Permission[];
};

export type UserNavConfig = {
  navbar: UserNavLink[];
};

type UserConfigInput = {
  role?: UserRole;
  permissions?: Permission[];
};

export function getUserNavConfig(user?: UserConfigInput): UserNavConfig {
  const baseLinks: UserNavLink[] = [
    {
      id: 'overview',
      label: 'Overview',
      href: '/dashboard',
      icon: 'dashboard',
      match: 'exact',
      permissions: [PERMISSIONS.ANALYTICS_READ],
    },
    {
      id: 'notifications',
      label: 'Notifications',
      href: '/dashboard/notifications',
      icon: 'notifications',
      permissions: [PERMISSIONS.OPS_SUPPORT_READ],
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/dashboard/settings',
      icon: 'settings',
      permissions: [PERMISSIONS.SETTINGS_GLOBAL],
    },
    { id: 'help', label: 'Help', href: '/help', icon: 'help' },
  ];

  const superAdminExtras: UserNavLink[] = user?.role === 'SUPERADMIN'
    ? [
        {
          id: 'control-center',
          label: 'Control Center',
          href: '/dashboard/control-center',
          icon: 'settings',
          permissions: [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.OPS_SUPPORT_READ],
        },
      ]
    : [];

  const combined = [...superAdminExtras, ...baseLinks];
  const allowedPermissions = new Set(user?.permissions ?? []);

  const filtered = combined.filter((link) => {
    if (!link.permissions || link.permissions.length === 0) {
      return true;
    }
    return link.permissions.some((permission) => allowedPermissions.has(permission));
  });

  return { navbar: filtered };
}
