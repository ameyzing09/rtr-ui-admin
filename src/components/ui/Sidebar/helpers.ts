import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  FileText, 
  LogOut 
} from 'lucide-react';

import type {
  NavigationItem,
  NavigationSection,
  NavigationLink,
  NavigationButton,
  NavigationCollapsible,
  NavigationDivider,
  NavigationHeader,
  SidebarProps
} from './types';

// Helper functions to create navigation items with proper typing

export function createNavigationLink(config: Omit<NavigationLink, 'type'>): NavigationLink {
  return {
    type: 'link',
    ...config,
  };
}

export function createNavigationButton(config: Omit<NavigationButton, 'type'>): NavigationButton {
  return {
    type: 'button',
    ...config,
  };
}

export function createNavigationCollapsible(config: Omit<NavigationCollapsible, 'type'>): NavigationCollapsible {
  return {
    type: 'collapsible',
    ...config,
  };
}

export function createNavigationDivider(config: Omit<NavigationDivider, 'type'>): NavigationDivider {
  return {
    type: 'divider',
    ...config,
  };
}

export function createNavigationHeader(config: Omit<NavigationHeader, 'type'>): NavigationHeader {
  return {
    type: 'header',
    ...config,
  };
}

export function createNavigationSection(config: NavigationSection): NavigationSection {
  return config;
}

// Permission-based filtering helpers
export function filterItemsByPermissions(
  items: NavigationItem[],
  userPermissions: string[]
): NavigationItem[] {
  return items.filter(item => {
    if (!item.permissions || item.permissions.length === 0) {
      return true; // No permissions required
    }
    
    return item.permissions.some(permission => 
      userPermissions.includes(permission)
    );
  }).map(item => {
    if (item.type === 'collapsible') {
      return {
        ...item,
        children: filterItemsByPermissions(item.children, userPermissions),
      };
    }
    return item;
  });
}

export function filterSectionsByPermissions(
  sections: NavigationSection[],
  userPermissions: string[]
): NavigationSection[] {
  return sections.filter(section => {
    if (!section.permissions || section.permissions.length === 0) {
      return true; // No permissions required for section
    }
    
    return section.permissions.some(permission => 
      userPermissions.includes(permission)
    );
  }).map(section => ({
    ...section,
    items: filterItemsByPermissions(section.items, userPermissions),
  })).filter(section => section.items.length > 0); // Remove empty sections
}

// Active state helpers
export function markActiveItems(
  items: NavigationItem[],
  currentPath: string
): NavigationItem[] {
  return items.map(item => {
    if (item.type === 'link') {
      const isActive = item.exactMatch 
        ? currentPath === item.href
        : currentPath.startsWith(item.href);
      
      return {
        ...item,
        isActive,
      };
    }
    
    if (item.type === 'collapsible') {
      const updatedChildren = markActiveItems(item.children, currentPath);
      const hasActiveChild = updatedChildren.some(child => 
        child.type === 'link' && child.isActive
      );
      
      return {
        ...item,
        children: updatedChildren,
        defaultOpen: hasActiveChild || item.defaultOpen,
      };
    }
    
    return item;
  });
}

export function markActiveSections(
  sections: NavigationSection[],
  currentPath: string
): NavigationSection[] {
  return sections.map(section => ({
    ...section,
    items: markActiveItems(section.items, currentPath),
  }));
}

// Preset configurations for common use cases
export function createAdminSidebar(config: {
  tenantName: string;
  tenantLogo?: string;
  userName: string;
  userEmail: string;
  userRole: string;
  onLogout: () => void;
  currentPath: string;
}): SidebarProps {
  const sections: NavigationSection[] = [
    {
      id: 'main',
      title: 'Main',
      items: [
        createNavigationLink({
          id: 'dashboard',
          label: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
        }),
        createNavigationLink({
          id: 'analytics',
          label: 'Analytics',
          href: '/dashboard/analytics',
          icon: BarChart3,
        }),
      ],
    },
    {
      id: 'management',
      title: 'Management',
      items: [
        createNavigationCollapsible({
          id: 'users',
          label: 'User Management',
          icon: Users,
          children: [
            createNavigationLink({
              id: 'users-list',
              label: 'All Users',
              href: '/dashboard/users',
            }),
            createNavigationLink({
              id: 'users-roles',
              label: 'Roles & Permissions',
              href: '/dashboard/users/roles',
            }),
          ],
        }),
        createNavigationLink({
          id: 'content',
          label: 'Content',
          href: '/dashboard/content',
          icon: FileText,
        }),
      ],
    },
  ];

  return {
    sections: markActiveSections(sections, config.currentPath),
    header: {
      title: config.tenantName,
      logo: config.tenantLogo ? {
        src: config.tenantLogo,
        alt: `${config.tenantName} logo`,
      } : undefined,
    },
    footer: {
      user: {
        name: config.userName,
        email: config.userEmail,
        role: config.userRole,
      },
      actions: [
        createNavigationButton({
          id: 'logout',
          label: 'Sign Out',
          icon: LogOut,
          onClick: config.onLogout,
          variant: 'danger',
        }),
      ],
    },
    enableSearch: true,
    variant: 'default',
  };
}

export function createSimpleSidebar(sections: NavigationSection[]): SidebarProps {
  return {
    sections,
    variant: 'minimal',
    isCollapsible: true,
    defaultCollapsed: false,
  };
}

export function createCompactSidebar(sections: NavigationSection[]): SidebarProps {
  return {
    sections,
    variant: 'compact',
    isCollapsible: true,
    defaultCollapsed: true,
    width: 'w-48',
    collapsedWidth: 'w-12',
  };
}
