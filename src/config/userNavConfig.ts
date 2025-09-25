export type UserNavLink = {
  id: string;
  label: string;
  href: string;
  icon?: 'dashboard' | 'notifications' | 'settings' | 'help';
  match?: 'exact' | 'startsWith';
};

export type UserNavConfig = {
  navbar: UserNavLink[];
};

export function getUserNavConfig(_user?: { role?: string; name?: string }): UserNavConfig {
  // You can tailor by role later. For now, provide a sensible default set
  const links: UserNavLink[] = [
    { id: 'overview', label: 'Overview', href: '/dashboard', icon: 'dashboard', match: 'exact' },
    { id: 'notifications', label: 'Notifications', href: '/dashboard/notifications', icon: 'notifications' },
    { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
    { id: 'help', label: 'Help', href: '/help', icon: 'help' },
  ];

  return { navbar: links };
}
