'use client';

import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  FileText,
  CreditCard,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  UserPlus,
  Database,
  Zap,
  Globe,
  Package,
  Folder
} from 'lucide-react';

import type { 
  NavigationSection, 
  SidebarProps 
} from '@/components/ui/Sidebar';

import {
  createNavigationLink,
  createNavigationButton,
  createNavigationCollapsible,
  createNavigationHeader,
  createNavigationDivider,
  markActiveSections,
} from '@/components/ui/Sidebar/helpers';

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
  const sections: NavigationSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      items: [
        createNavigationLink({
          id: 'dashboard',
          label: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          exactMatch: true,
          description: 'Main dashboard overview',
        }),
        createNavigationLink({
          id: 'analytics',
          label: 'Analytics',
          href: '/dashboard/analytics',
          icon: BarChart3,
          description: 'Data insights and reports',
          badge: {
            text: 'NEW',
            variant: 'primary',
          },
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
          description: 'Manage users and permissions',
          children: [
            createNavigationLink({
              id: 'users-list',
              label: 'All Users',
              href: '/dashboard/users',
              icon: Users,
              description: 'View and manage all users',
            }),
            createNavigationLink({
              id: 'users-roles',
              label: 'Roles & Permissions',
              href: '/dashboard/users/roles',
              icon: Shield,
              description: 'Configure user roles',
              permissions: ['admin'],
            }),
            createNavigationButton({
              id: 'users-invite',
              label: 'Invite User',
              icon: UserPlus,
              onClick: () => console.log('Invite user clicked'),
              variant: 'primary',
              description: 'Send invitation to new user',
            }),
          ],
          defaultOpen: false,
        }),
        createNavigationCollapsible({
          id: 'content',
          label: 'Content Management',
          icon: FileText,
          children: [
            createNavigationLink({
              id: 'content-pages',
              label: 'Pages',
              href: '/dashboard/content/pages',
              icon: FileText,
            }),
            createNavigationLink({
              id: 'content-media',
              label: 'Media Library',
              href: '/dashboard/content/media',
              icon: Folder,
            }),
            createNavigationLink({
              id: 'content-templates',
              label: 'Templates',
              href: '/dashboard/content/templates',
              icon: Package,
            }),
          ],
        }),
        createNavigationLink({
          id: 'billing',
          label: 'Billing & Plans',
          href: '/dashboard/billing',
          icon: CreditCard,
          description: 'Manage subscriptions and billing',
          badge: {
            text: '3',
            variant: 'warning',
          },
        }),
      ],
    },
    {
      id: 'system',
      title: 'System',
      items: [
        createNavigationHeader({
          id: 'system-header',
          label: 'System Administration',
          icon: Zap,
          description: 'Administrative tools and settings',
        }),
        createNavigationCollapsible({
          id: 'infrastructure',
          label: 'Infrastructure',
          icon: Database,
          permissions: ['admin', 'developer'],
          children: [
            createNavigationLink({
              id: 'infrastructure-monitoring',
              label: 'System Monitoring',
              href: '/dashboard/infrastructure/monitoring',
              icon: Zap,
              description: 'Monitor system health',
            }),
            createNavigationLink({
              id: 'infrastructure-logs',
              label: 'Application Logs',
              href: '/dashboard/infrastructure/logs',
              icon: FileText,
              description: 'View application logs',
            }),
            createNavigationLink({
              id: 'infrastructure-database',
              label: 'Database',
              href: '/dashboard/infrastructure/database',
              icon: Database,
              description: 'Database management',
              permissions: ['admin'],
            }),
          ],
        }),
        createNavigationLink({
          id: 'security',
          label: 'Security',
          href: '/dashboard/security',
          icon: Shield,
          description: 'Security settings and audit logs',
          permissions: ['admin'],
        }),
        createNavigationLink({
          id: 'integrations',
          label: 'Integrations',
          href: '/dashboard/integrations',
          icon: Globe,
          description: 'Third-party integrations',
          badge: {
            text: '2',
            variant: 'success',
          },
        }),
        createNavigationDivider({
          id: 'system-divider',
          label: 'Configuration',
        }),
        createNavigationLink({
          id: 'notifications',
          label: 'Notifications',
          href: '/dashboard/notifications',
          icon: Bell,
          description: 'Notification settings',
        }),
        createNavigationLink({
          id: 'settings',
          label: 'Settings',
          href: '/dashboard/settings',
          icon: Settings,
          description: 'Application settings',
          shortcut: '⌘,',
        }),
      ],
    },
  ];

  // Filter sections by permissions if provided
  const filteredSections = config.userPermissions 
    ? sections.map(section => ({
        ...section,
        items: section.items.filter(item => {
          if (!item.permissions || item.permissions.length === 0) {
            return true;
          }
          return item.permissions.some(permission => 
            config.userPermissions!.includes(permission)
          );
        }),
      })).filter(section => section.items.length > 0)
    : sections;

  return {
    sections: markActiveSections(filteredSections, config.currentPath),
    
    header: {
      title: config.tenantName,
      subtitle: 'Admin Dashboard',
      logo: config.tenantLogo ? {
        src: config.tenantLogo,
        alt: `${config.tenantName} logo`,
      } : undefined,
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
    
    // Advanced features
    onItemClick: (item) => {
      console.log('Navigation item clicked:', item);
      // Add analytics tracking here
    },
    
    onSectionToggle: (sectionId, isOpen) => {
      console.log('Section toggled:', sectionId, isOpen);
      // Save user preferences here
    },
  };
}

// Simple sidebar configuration for other pages
export function createSimpleSidebarConfig(currentPath: string): SidebarProps {
  const sections: NavigationSection[] = [
    {
      id: 'main',
      items: [
        createNavigationLink({
          id: 'back-to-dashboard',
          label: 'Back to Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
        }),
        createNavigationDivider({
          id: 'divider-1',
        }),
        createNavigationLink({
          id: 'help',
          label: 'Help',
          href: '/help',
          icon: HelpCircle,
        }),
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
