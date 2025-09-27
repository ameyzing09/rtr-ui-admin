import type { Permission } from '@/lib/auth/permissions';
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

export function getUserNavConfig(_user?: { role?: UserRole; permissions?: Permission[] }): UserNavConfig {
  const links: UserNavLink[] = [
    { id: 'overview', label: 'Overview', href: '/dashboard', icon: 'dashboard', match: 'exact', permissions: ['platform:overview:view'] },
    { id: 'notifications', label: 'Notifications', href: '/dashboard/notifications', icon: 'notifications', permissions: ['platform:ops:view'] },
    { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: 'settings', permissions: ['platform:settings:manage'] },
    { id: 'help', label: 'Help', href: '/help', icon: 'help' },
  ];

  return { navbar: links };
}
