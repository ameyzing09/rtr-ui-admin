import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Settings,
  CreditCard,
  Zap,
  Activity,
  Layers,
  Shield,
  Bell,
  HelpCircle,
} from 'lucide-react';
import type { NavItem } from '@/components/layout/Navbar';
import type { SideGroup } from '@/components/layout/Sidebar';
import { platformNavConfig, type NavIconKey } from './platformNavConfig';
import { getUserNavConfig } from './userNavConfig';
import type { Permission } from '@/lib/auth/types';
import type { UserRole } from '@/lib/auth/types';

const platformIconMap: Record<NavIconKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  tenants: Layers,
  users: Users,
  billing: CreditCard,
  integrations: Zap,
  health: Activity,
  settings: Settings,
  catalog: Layers,
  security: Shield,
  zap: Zap,
  layers: Layers,
  activity: Activity,
  credit: CreditCard,
};

const userIconMap = {
  dashboard: LayoutDashboard,
  notifications: Bell,
  settings: Settings,
  help: HelpCircle,
} as const;

type UserIconKey = keyof typeof userIconMap;

interface BuildNavArgs {
  role?: UserRole;
  permissions?: Permission[];
}

export function buildNavbarItems({ role, permissions = [] }: BuildNavArgs = {}): NavItem[] {
  const config = getUserNavConfig({ role, permissions });

  return config.navbar
    .filter((item) => !item.permissions || item.permissions.some((permission) => permissions.includes(permission)))
    .map((item) => ({
      label: item.label,
      href: item.href,
      icon: item.icon ? userIconMap[item.icon as UserIconKey] : undefined,
      match: item.match || (item.href === '/dashboard' ? 'exact' : 'startsWith'),
    }));
}

export const sidebarGroups: SideGroup[] = platformNavConfig.sidebarSections.map((section) => ({
  title: section.title,
  items: section.items.map((item) => ({
    label: item.label,
    href: item.href,
    icon: item.icon ? platformIconMap[item.icon] : undefined,
    match: item.href === '/dashboard' ? 'exact' : 'startsWith',
  })),
}));
