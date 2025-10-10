'use client';

import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Settings,
  CreditCard,
  Shield,
  HelpCircle,
  LogOut,
  Zap,
  Package,
  Layers,
  Activity,
} from 'lucide-react';

import type { NavigationSection, SidebarProps } from '@/components/ui/Sidebar';
import {
  createNavigationLink,
  createNavigationButton,
  createNavigationDivider,
  markActiveSections,
} from '@/components/ui/Sidebar/helpers';
import { platformNavConfig, type NavIconKey } from './platformNavConfig';
import { superadminNavConfig, getSuperadminIcon } from './superadminNavConfig';

const iconMap: Record<NavIconKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  tenants: Layers,
  users: Users,
  billing: CreditCard,
  integrations: Zap,
  health: Activity,
  settings: Settings,
  catalog: Package,
  security: Shield,
  zap: Zap,
  layers: Layers,
  activity: Activity,
  credit: CreditCard,
};

// Icon to render on section headings. When a section has an icon here,
// its child items will not display their own icons to avoid duplication.
const sectionIconMap: Record<string, LucideIcon | undefined> = {
  overview: LayoutDashboard,
  tenants: Layers,
  'users-access': Users,
  billing: CreditCard,
  'catalog-templates': Package,
  integrations: Zap,
  'adoption-health': Activity,
  observability: Shield,
  experiments: Zap,
  'ops-support': HelpCircle,
  'global-settings': Settings,
};

export function createDashboardSidebarConfig(config: {
  tenantName: string;
  tenantLogo?: string;
  userName: string;
  userEmail: string;
  userRole?: string;
  currentPath: string;
  onLogout: () => void;
  userPermissions?: string[];
}): SidebarProps {
  const sections: NavigationSection[] = platformNavConfig.sidebarSections.map((section) => ({
    id: section.id,
    title: section.title,
    items: section.items.map((item) => {
      const parts = item.href.split('/').filter(Boolean);
      const exact = parts.length <= 2;
      return createNavigationLink({ id: item.id, label: item.label, href: item.href, icon: (sectionIconMap[section.id] ? undefined : (item.icon ? iconMap[item.icon] : undefined)), exactMatch: exact });
    }),
  }));

  // Filter sections by permissions if provided (items default to visible)
  const filteredSections = config.userPermissions
    ? sections
        .map((section) => ({
          ...section,
          items: section.items.filter((item: { permissions?: string[] }) => {
            if (!item.permissions || item.permissions.length === 0) return true;
            return item.permissions.some((p: string) => config.userPermissions!.includes(p));
          }),
        }))
        .filter((s) => s.items.length > 0)
    : sections;

  return {
    sections: markActiveSections(filteredSections, config.currentPath),

    header: {
      title: config.tenantName,
      subtitle: 'Admin Dashboard',
      logo: config.tenantLogo
        ? {
            src: config.tenantLogo,
            alt: `${config.tenantName} logo`,
          }
        : undefined,
    },

    footer: {
      user: {
        name: config.userName,
        email: config.userEmail,
        role: config.userRole || 'User',
      },
      items: [
        createNavigationLink({
          id: 'help',
          label: 'Help & Support',
          href: '/help',
          icon: HelpCircle,
          description: 'Get help and support',
        }),
      ],
      actions: [
        createNavigationButton({
          id: 'logout',
          label: 'Sign Out',
          icon: LogOut,
          onClick: config.onLogout,
          variant: 'danger',
          description: 'Sign out of your account',
        }),
      ],
    },

    enableSearch: true,
    searchPlaceholder: 'Search navigation...',
    variant: 'default',
    isCollapsible: true,
    defaultCollapsed: false,

    onItemClick: (item) => {
      console.log('Navigation item clicked:', item);
    },

    onSectionToggle: (sectionId, isOpen) => {
      console.log('Section toggled:', sectionId, isOpen);
    },
  };
}

export function createSuperadminSidebarConfig(config: {
  tenantName?: string;
  tenantLogo?: string;
  userName: string;
  userEmail: string;
  currentPath: string;
  onLogout: () => void;
}): SidebarProps {
  const sections: NavigationSection[] = superadminNavConfig.sidebarSections.map((section) => ({
    id: section.id,
    title: section.title,
    items: section.items.map((item) => {
      const parts = item.href.split('/').filter(Boolean);
      const exact = parts.length <= 2;
      return createNavigationLink({ 
        id: item.id, 
        label: item.label, 
        href: item.href, 
        icon: item.icon ? getSuperadminIcon(item.icon) : undefined, 
        exactMatch: exact,
        description: item.description,
      });
    }),
  }));

  return {
    sections: markActiveSections(sections, config.currentPath),

    header: {
      title: config.tenantName || 'RTR Admin Portal',
      subtitle: 'Super Admin',
      logo: config.tenantLogo
        ? {
            src: config.tenantLogo,
            alt: `${config.tenantName} logo`,
          }
        : undefined,
    },

    footer: {
      user: {
        name: config.userName,
        email: config.userEmail,
        role: 'Super Admin',
      },
      items: [
        createNavigationLink({
          id: 'help',
          label: 'Help & Support',
          href: '/help',
          icon: HelpCircle,
          description: 'Get help and support',
        }),
      ],
      actions: [
        createNavigationButton({
          id: 'logout',
          label: 'Sign Out',
          icon: LogOut,
          onClick: config.onLogout,
          variant: 'danger',
          description: 'Sign out of your account',
        }),
      ],
    },

    enableSearch: true,
    searchPlaceholder: 'Search navigation...',
    variant: 'default',
    isCollapsible: true,
    defaultCollapsed: false,

    onItemClick: (item) => {
      console.log('Navigation item clicked:', item);
    },

    onSectionToggle: (sectionId, isOpen) => {
      console.log('Section toggled:', sectionId, isOpen);
    },
  };
}

export function createSimpleSidebarConfig(currentPath: string): SidebarProps {
  const sections: NavigationSection[] = [
    {
      id: 'main',
      items: [
        createNavigationLink({ id: 'back', label: 'Back to Dashboard', href: '/dashboard', icon: LayoutDashboard }),
        createNavigationDivider({ id: 'd1' }),
        createNavigationLink({ id: 'help', label: 'Help', href: '/help', icon: HelpCircle }),
      ],
    },
  ];

  return {
    sections: markActiveSections(sections, currentPath),
    variant: 'minimal',
    isCollapsible: true,
    defaultCollapsed: false,
    width: 'w-48',
  };
}
