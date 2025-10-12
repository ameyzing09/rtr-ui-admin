import type { LucideIcon } from 'lucide-react';
import {
  Users,
  Building,
  Plus,
  Clock,
  Shield,
  Settings,
  BarChart3,
  Database,
  Activity,
  Home,
  Search,
  Command,
  Layers,
  CreditCard,
  Zap,
  FileText,
  Mail,
  Webhook,
  AlertTriangle,
  Archive,
  Flag,
  Ticket,
  Megaphone,
  Palette,
  Languages,
  Key,
  UserCheck,
} from 'lucide-react';

import type { Permission } from '@/lib/rbac/permissions';
import { PERMISSIONS } from '@/lib/rbac/permissions';

// User roles in the system
export type UserRole = 'superadmin' | 'admin' | 'hr' | 'interviewer' | 'candidate';

export type NavIconKey =
  | 'dashboard'
  | 'users'
  | 'settings'
  | 'catalog'
  | 'zap'
  | 'layers'
  | 'activity'
  | 'credit'
  | 'building'
  | 'plus'
  | 'clock'
  | 'shield'
  | 'chart'
  | 'database'
  | 'search'
  | 'command'
  | 'file'
  | 'mail'
  | 'webhook'
  | 'alert'
  | 'archive'
  | 'flag'
  | 'ticket'
  | 'megaphone'
  | 'palette'
  | 'languages'
  | 'key'
  | 'usercheck';

const iconMap: Record<NavIconKey, LucideIcon> = {
  dashboard: Home,
  users: Users,
  settings: Settings,
  catalog: FileText,
  zap: Zap,
  layers: Layers,
  activity: Activity,
  credit: CreditCard,
  building: Building,
  plus: Plus,
  clock: Clock,
  shield: Shield,
  chart: BarChart3,
  database: Database,
  search: Search,
  command: Command,
  file: FileText,
  mail: Mail,
  webhook: Webhook,
  alert: AlertTriangle,
  archive: Archive,
  flag: Flag,
  ticket: Ticket,
  megaphone: Megaphone,
  palette: Palette,
  languages: Languages,
  key: Key,
  usercheck: UserCheck,
};

export type NavLinkConfig = {
  id: string;
  label: string;
  href: string;
  icon?: NavIconKey;
  description?: string;
  permission?: Permission; // Single permission required for this item
  requiredFlags?: string[];
  requiredRole?: UserRole; // Specific role required for this item (stricter than permission)
};

export type NavSectionConfig = {
  id: string;
  title: string;
  permission?: Permission; // Single permission required for this section
  requiredRole?: UserRole; // Specific role required for this section (stricter than permission)
  items: NavLinkConfig[];
};

export const unifiedNavConfig = {
  navbar: <NavLinkConfig[]>[
    // Superadmin navbar items (only visible to SUPERADMIN role)
    {
      id: 'sa-overview',
      label: 'Overview',
      href: '/dashboard',
      icon: 'dashboard',
      permission: PERMISSIONS.ANALYTICS_READ,
      requiredRole: 'superadmin',
      description: 'System overview'
    },
    {
      id: 'sa-users',
      label: 'System Users',
      href: '/sa/users',
      icon: 'users',
      permission: PERMISSIONS.SYS_USER_LIST,
      requiredRole: 'superadmin',
      description: 'Manage system users'
    },
    {
      id: 'sa-health',
      label: 'System Health',
      href: '/sa/health',
      icon: 'activity',
      permission: PERMISSIONS.SYS_HEALTH_READ,
      requiredRole: 'superadmin',
      description: 'Monitor system health'
    },
    {
      id: 'sa-settings',
      label: 'Settings',
      href: '/sa/settings',
      icon: 'settings',
      permission: PERMISSIONS.SETTINGS_GLOBAL,
      requiredRole: 'superadmin',
      description: 'System configuration'
    },
    
    // Tenant navbar items
    {
      id: 'overview',
      label: 'Overview',
      href: '/dashboard',
      icon: 'dashboard',
      permission: PERMISSIONS.ANALYTICS_READ,
    },
    {
      id: 'jobs',
      label: 'Jobs',
      href: '/dashboard/jobs',
      icon: 'file',
      permission: PERMISSIONS.JOB_LIST,
    },
    {
      id: 'applications',
      label: 'Applications',
      href: '/dashboard/applications',
      icon: 'users',
      permission: PERMISSIONS.APPLICATION_LIST,
    },
    {
      id: 'team',
      label: 'Team',
      href: '/dashboard/team',
      icon: 'users',
      permission: PERMISSIONS.MEMBER_LIST,
    },
    {
      id: 'interviews',
      label: 'Interviews',
      href: '/dashboard/interviews',
      icon: 'users',
      permission: PERMISSIONS.INTERVIEW_LIST,
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/dashboard/settings',
      icon: 'settings',
      permission: PERMISSIONS.SETTINGS_READ,
    },
  ],

  sidebarSections: <NavSectionConfig[]>[
    // Superadmin sections (only visible to SUPERADMIN role)
    {
      id: 'tenant-management',
      title: 'Tenant Management',
      permission: PERMISSIONS.TENANT_LIST,
      requiredRole: 'superadmin',
      items: [
        {
          id: 'all-tenants',
          label: 'All Tenants',
          href: '/sa/tenants',
          icon: 'building',
          description: 'View and manage all tenants',
          permission: PERMISSIONS.TENANT_LIST,
          requiredRole: 'superadmin',
        },
        {
          id: 'onboarding-queue',
          label: 'Onboarding Queue',
          href: '/sa/tenants/onboarding',
          icon: 'clock',
          description: 'Monitor tenant provisioning',
          permission: PERMISSIONS.TENANT_STATUS,
          requiredRole: 'superadmin',
          requiredFlags: ['TENANT_ONBOARDING_QUEUE'],
        },
        {
          id: 'create-tenant',
          label: 'Create Tenant',
          href: '/sa/tenants/create',
          icon: 'plus',
          description: 'Add new tenant',
          permission: PERMISSIONS.TENANT_CREATE,
          requiredRole: 'superadmin',
        },
        {
          id: 'impersonate-tenant',
          label: 'Impersonate Tenant',
          href: '/sa/tenants/impersonate',
          icon: 'usercheck',
          description: 'Impersonate tenant user',
          permission: PERMISSIONS.TENANT_IMPERSONATE,
          requiredRole: 'superadmin',
        },
      ],
    },
    {
      id: 'system-management',
      title: 'System Management',
      permission: PERMISSIONS.SYS_USER_LIST,
      requiredRole: 'superadmin',
      items: [
        {
          id: 'system-users',
          label: 'System Users',
          href: '/sa/users',
          icon: 'users',
          description: 'Manage system administrators',
          permission: PERMISSIONS.SYS_USER_LIST,
          requiredRole: 'superadmin',
        },
        {
          id: 'system-health',
          label: 'System Health',
          href: '/sa/health',
          icon: 'activity',
          description: 'Monitor system status',
          permission: PERMISSIONS.SYS_HEALTH_READ,
          requiredRole: 'superadmin',
        },
        {
          id: 'analytics',
          label: 'Analytics & Usage',
          href: '/sa/analytics',
          icon: 'chart',
          description: 'System-wide analytics',
          permission: PERMISSIONS.ANALYTICS_READ,
          requiredRole: 'superadmin',
        },
      ],
    },
    {
      id: 'configuration',
      title: 'Configuration',
      permission: PERMISSIONS.SETTINGS_GLOBAL,
      requiredRole: 'superadmin',
      items: [
        {
          id: 'global-settings',
          label: 'Global Settings',
          href: '/sa/settings',
          icon: 'settings',
          description: 'System configuration',
          permission: PERMISSIONS.SETTINGS_GLOBAL,
          requiredRole: 'superadmin',
        },
        {
          id: 'security',
          label: 'Security',
          href: '/sa/security',
          icon: 'shield',
          description: 'Security policies',
          permission: PERMISSIONS.SETTINGS_SECURITY,
          requiredRole: 'superadmin',
        },
        {
          id: 'database',
          label: 'Database',
          href: '/sa/database',
          icon: 'database',
          description: 'Database management',
          permission: PERMISSIONS.SETTINGS_DB,
          requiredRole: 'superadmin',
        },
      ],
    },

    // Tenant sections
    {
      id: 'overview',
      title: 'Overview',
      permission: PERMISSIONS.ANALYTICS_READ,
      items: [
        {
          id: 'overview-home',
          label: 'Dashboard',
          href: '/dashboard',
          icon: 'dashboard',
          permission: PERMISSIONS.ANALYTICS_READ,
        },
      ],
    },
    {
      id: 'tenants',
      title: 'Tenants',
      permissions: ['platform:tenants:manage'],
      roles: ['admin'],
      items: [
        { 
          id: 'tenants-all', 
          label: 'All Tenants', 
          href: '/dashboard/tenants', 
          icon: 'layers', 
          permissions: ['platform:tenants:manage'],
          roles: ['admin'],
        },
        { 
          id: 'tenants-onboarding', 
          label: 'Onboarding Queue', 
          href: '/dashboard/tenants/onboarding', 
          icon: 'clock',
          permissions: ['platform:tenants:manage'],
          roles: ['admin'],
          requiredFlags: ['TENANT_ONBOARDING_QUEUE'],
        },
        { 
          id: 'tenants-create', 
          label: 'Create Tenant', 
          href: '/dashboard/tenants/create', 
          icon: 'plus',
          permissions: ['platform:tenants:manage'],
          roles: ['admin'],
        },
        { 
          id: 'tenants-impersonate', 
          label: 'Impersonate', 
          href: '/dashboard/tenants/impersonate', 
          icon: 'usercheck',
          permissions: ['platform:tenants:manage'],
          roles: ['admin'],
        },
      ],
    },
    {
      id: 'users-access',
      title: 'Users & Access',
      permissions: ['platform:users:manage'],
      roles: ['admin', 'hr'],
      items: [
        { 
          id: 'platform-users', 
          label: 'Platform Users', 
          href: '/dashboard/users', 
          icon: 'users', 
          permissions: ['platform:users:manage'],
          roles: ['admin', 'hr'],
        },
        { 
          id: 'roles-perms', 
          label: 'Roles & Permissions', 
          href: '/dashboard/users/roles', 
          icon: 'shield',
          permissions: ['platform:users:manage'],
          roles: ['admin'],
        },
        { 
          id: 'sso-providers', 
          label: 'SSO Providers', 
          href: '/dashboard/users/sso', 
          icon: 'key',
          permissions: ['platform:users:manage'],
          roles: ['admin'],
        },
        { 
          id: 'api-keys', 
          label: 'API Keys (Platform)', 
          href: '/dashboard/users/api-keys', 
          icon: 'key',
          permissions: ['platform:users:manage'],
          roles: ['admin'],
        },
      ],
    },
    {
      id: 'billing',
      title: 'Billing',
      permissions: ['platform:billing:manage'],
      roles: ['admin'],
      items: [
        { 
          id: 'plans-pricing', 
          label: 'Plans & Pricing', 
          href: '/dashboard/billing/plans', 
          icon: 'credit', 
          permissions: ['platform:billing:manage'],
          roles: ['admin'],
        },
        { 
          id: 'subscriptions', 
          label: 'Subscriptions', 
          href: '/dashboard/billing/subscriptions', 
          icon: 'layers',
          permissions: ['platform:billing:manage'],
          roles: ['admin'],
        },
        { 
          id: 'invoices-taxes', 
          label: 'Invoices & Taxes', 
          href: '/dashboard/billing/invoices', 
          icon: 'file',
          permissions: ['platform:billing:manage'],
          roles: ['admin'],
        },
        { 
          id: 'coupons', 
          label: 'Coupons/Promos', 
          href: '/dashboard/billing/coupons', 
          icon: 'ticket',
          permissions: ['platform:billing:manage'],
          roles: ['admin'],
        },
      ],
    },
    {
      id: 'catalog-templates',
      title: 'Catalog & Templates',
      permissions: ['platform:catalog:manage'],
      roles: ['admin', 'hr'],
      items: [
        { 
          id: 'pipeline-templates', 
          label: 'Pipeline Templates', 
          href: '/dashboard/catalog/pipelines', 
          icon: 'catalog', 
          permissions: ['platform:catalog:manage'],
          roles: ['admin', 'hr'],
        },
        { 
          id: 'interview-kits', 
          label: 'Interview Kits', 
          href: '/dashboard/catalog/interviews', 
          icon: 'users',
          permissions: ['platform:catalog:manage'],
          roles: ['admin', 'hr', 'interviewer'],
        },
        { 
          id: 'job-schema', 
          label: 'Job Schema', 
          href: '/dashboard/catalog/job-schema', 
          icon: 'file',
          permissions: ['platform:catalog:manage'],
          roles: ['admin', 'hr'],
        },
        { 
          id: 'email-sms-templates', 
          label: 'Email/SMS Templates', 
          href: '/dashboard/catalog/communications', 
          icon: 'mail',
          permissions: ['platform:catalog:manage'],
          roles: ['admin', 'hr'],
        },
      ],
    },
    {
      id: 'integrations',
      title: 'Integrations (Platform)',
      permissions: ['platform:integrations:manage'],
      roles: ['admin'],
      items: [
        { 
          id: 'integration-catalog', 
          label: 'Integration Catalog', 
          href: '/dashboard/integrations', 
          icon: 'zap', 
          permissions: ['platform:integrations:manage'],
          roles: ['admin'],
        },
        { 
          id: 'providers-credentials', 
          label: 'Providers & Credentials', 
          href: '/dashboard/integrations/providers', 
          icon: 'key',
          permissions: ['platform:integrations:manage'],
          roles: ['admin'],
        },
      ],
    },
    {
      id: 'adoption-health',
      title: 'Adoption & Health',
      permissions: ['platform:health:view'],
      roles: ['admin'],
      items: [
        { 
          id: 'webhooks-hub', 
          label: 'Webhooks Hub', 
          href: '/dashboard/health/webhooks', 
          icon: 'webhook',
          permissions: ['platform:health:view'],
          roles: ['admin'],
        },
        { 
          id: 'platform-health', 
          label: 'Platform Health', 
          href: '/dashboard/health/platform', 
          icon: 'activity', 
          permissions: ['platform:health:view'],
          roles: ['admin'],
        },
        { 
          id: 'service-health', 
          label: 'Service Health', 
          href: '/dashboard/health/services', 
          icon: 'activity',
          permissions: ['platform:health:view'],
          roles: ['admin'],
        },
        { 
          id: 'queues-jobs', 
          label: 'Queues & Jobs', 
          href: '/dashboard/health/queues', 
          icon: 'layers',
          permissions: ['platform:health:view'],
          roles: ['admin'],
        },
        { 
          id: 'rate-limits', 
          label: 'Rate Limits', 
          href: '/dashboard/health/rate-limits', 
          icon: 'shield',
          permissions: ['platform:health:view'],
          roles: ['admin'],
        },
      ],
    },
    {
      id: 'observability',
      title: 'Observability & Compliance',
      permissions: ['platform:observability:view'],
      roles: ['admin'],
      items: [
        { 
          id: 'audit-logs', 
          label: 'Audit Logs', 
          href: '/dashboard/obs/audit-logs', 
          icon: 'file',
          permissions: ['platform:observability:view'],
          roles: ['admin'],
        },
        { 
          id: 'activity-stream', 
          label: 'Activity Stream', 
          href: '/dashboard/obs/activity', 
          icon: 'activity',
          permissions: ['platform:observability:view'],
          roles: ['admin'],
        },
        { 
          id: 'errors-alerts', 
          label: 'Errors & Alerts', 
          href: '/dashboard/obs/errors', 
          icon: 'alert',
          permissions: ['platform:observability:view'],
          roles: ['admin'],
        },
        { 
          id: 'privacy-requests', 
          label: 'Privacy Requests', 
          href: '/dashboard/obs/privacy', 
          icon: 'shield',
          permissions: ['platform:observability:view'],
          roles: ['admin'],
        },
        { 
          id: 'backups-restore', 
          label: 'Backups & Restore', 
          href: '/dashboard/obs/backups', 
          icon: 'archive',
          permissions: ['platform:observability:view'],
          roles: ['admin'],
        },
      ],
    },
    {
      id: 'experiments',
      title: 'Experiments & Flags',
      permissions: ['platform:experiments:view'],
      roles: ['admin'],
      items: [
        { 
          id: 'feature-flags', 
          label: 'Feature Flags', 
          href: '/dashboard/experiments/flags', 
          icon: 'flag',
          permissions: ['platform:experiments:view'],
          roles: ['admin'],
        },
        { 
          id: 'ab-experiments', 
          label: 'A/B Experiments', 
          href: '/dashboard/experiments/ab', 
          icon: 'chart',
          permissions: ['platform:experiments:view'],
          roles: ['admin'],
        },
      ],
    },
    {
      id: 'ops-support',
      title: 'Ops & Support',
      permissions: ['platform:ops:view'],
      roles: ['admin', 'hr'],
      items: [
        { 
          id: 'support-tickets', 
          label: 'Support Tickets', 
          href: '/dashboard/support/tickets', 
          icon: 'ticket',
          permissions: ['platform:ops:view'],
          roles: ['admin', 'hr'],
        },
        { 
          id: 'announcements', 
          label: 'Announcements', 
          href: '/dashboard/support/announcements', 
          icon: 'megaphone',
          permissions: ['platform:ops:view'],
          roles: ['admin', 'hr'],
        },
        { 
          id: 'status-page', 
          label: 'Status Page', 
          href: '/dashboard/support/status', 
          icon: 'activity',
          permissions: ['platform:ops:view'],
          roles: ['admin'],
        },
      ],
    },
    {
      id: 'global-settings',
      title: 'Global Settings',
      permissions: ['platform:settings:manage'],
      roles: ['admin'],
      items: [
        { 
          id: 'platform-settings', 
          label: 'Platform Settings', 
          href: '/dashboard/settings', 
          icon: 'settings', 
          permissions: ['platform:settings:manage'],
          roles: ['admin'],
        },
        { 
          id: 'theming', 
          label: 'Theming', 
          href: '/dashboard/settings/theming', 
          icon: 'palette',
          permissions: ['platform:settings:manage'],
          roles: ['admin'],
        },
        { 
          id: 'locales', 
          label: 'Locales', 
          href: '/dashboard/settings/locales', 
          icon: 'languages',
          permissions: ['platform:settings:manage'],
          roles: ['admin'],
        },
      ],
    },

    // HR specific sections
    {
      id: 'hr-dashboard',
      title: 'HR Dashboard',
      roles: ['hr'],
      items: [
        { 
          id: 'hr-overview', 
          label: 'HR Overview', 
          href: '/dashboard/hr', 
          icon: 'dashboard',
          roles: ['hr'],
        },
        { 
          id: 'candidates', 
          label: 'Candidates', 
          href: '/dashboard/hr/candidates', 
          icon: 'users',
          roles: ['hr'],
        },
        { 
          id: 'jobs', 
          label: 'Job Postings', 
          href: '/dashboard/hr/jobs', 
          icon: 'file',
          roles: ['hr'],
        },
      ],
    },

    // Interviewer specific sections
    {
      id: 'interview-dashboard',
      title: 'Interview Dashboard',
      roles: ['interviewer'],
      items: [
        { 
          id: 'my-interviews', 
          label: 'My Interviews', 
          href: '/dashboard/interviews', 
          icon: 'users',
          roles: ['interviewer'],
        },
        { 
          id: 'feedback', 
          label: 'Feedback', 
          href: '/dashboard/interviews/feedback', 
          icon: 'file',
          roles: ['interviewer'],
        },
      ],
    },

    // Candidate specific sections
    {
      id: 'candidate-dashboard',
      title: 'My Applications',
      roles: ['candidate'],
      items: [
        { 
          id: 'applications', 
          label: 'Applications', 
          href: '/dashboard/candidate/applications', 
          icon: 'file',
          roles: ['candidate'],
        },
        { 
          id: 'interviews', 
          label: 'Interviews', 
          href: '/dashboard/candidate/interviews', 
          icon: 'users',
          roles: ['candidate'],
        },
        { 
          id: 'profile', 
          label: 'Profile', 
          href: '/dashboard/candidate/profile', 
          icon: 'settings',
          roles: ['candidate'],
        },
      ],
    },
  ] as NavSectionConfig[],
} as const;

export function getIcon(iconKey: NavIconKey): LucideIcon {
  return iconMap[iconKey];
}

/**
 * Filter navigation items based on user role and permissions
 */
export function getNavItemsForRole(
  userRole: UserRole,
  userPermissions: Permission[] = []
): {
  navbar: NavLinkConfig[];
  sidebarSections: NavSectionConfig[];
} {
  const filterItems = (items: NavLinkConfig[]): NavLinkConfig[] => {
    return items.filter(item => {
      // Context separation: superadmin vs tenant context
      if (userRole === 'superadmin') {
        // Superadmins should ONLY see items marked with requiredRole: 'superadmin'
        // This prevents mixing superadmin and tenant navigation items
        if (!item.requiredRole || item.requiredRole !== 'superadmin') {
          return false;
        }
      } else {
        // Non-superadmin users should NOT see superadmin-only items
        if (item.requiredRole === 'superadmin') {
          return false;
        }
      }

      // Check requiredRole match (for other roles)
      if (item.requiredRole && item.requiredRole !== userRole) {
        return false;
      }

      // New permission-based check (single permission)
      if (item.permission) {
        return userPermissions.includes(item.permission);
      }

      // Legacy: Check role-based access (for backward compatibility)
      if ((item as unknown as { roles?: UserRole[] }).roles) {
        const roles = (item as unknown as { roles: UserRole[] }).roles;
        if (!roles.includes(userRole)) {
          return false;
        }
      }

      // Legacy: Check permission-based access (array)
      if ((item as unknown as { permissions?: Permission[] }).permissions) {
        const permissions = (item as unknown as { permissions: Permission[] }).permissions;
        if (permissions.length > 0) {
          return permissions.some(permission => userPermissions.includes(permission));
        }
      }

      return true;
    });
  };

  const filterSections = (sections: NavSectionConfig[]): NavSectionConfig[] => {
    return sections
      .filter(section => {
        // Context separation: superadmin vs tenant context
        if (userRole === 'superadmin') {
          // Superadmins should ONLY see sections marked with requiredRole: 'superadmin'
          if (!section.requiredRole || section.requiredRole !== 'superadmin') {
            return false;
          }
        } else {
          // Non-superadmin users should NOT see superadmin-only sections
          if (section.requiredRole === 'superadmin') {
            return false;
          }
        }

        // Check requiredRole match (for other roles)
        if (section.requiredRole && section.requiredRole !== userRole) {
          return false;
        }

        // New permission-based check (single permission)
        if (section.permission) {
          return userPermissions.includes(section.permission);
        }

        // Legacy: Check role-based access for section
        if ((section as unknown as { roles?: UserRole[] }).roles) {
          const roles = (section as unknown as { roles: UserRole[] }).roles;
          if (!roles.includes(userRole)) {
            return false;
          }
        }

        // Legacy: Check permission-based access for section
        if ((section as unknown as { permissions?: Permission[] }).permissions) {
          const permissions = (section as unknown as { permissions: Permission[] }).permissions;
          if (permissions.length > 0) {
            const hasPermission = permissions.some(permission =>
              userPermissions.includes(permission)
            );
            if (!hasPermission) return false;
          }
        }

        return true;
      })
      .map(section => ({
        ...section,
        items: filterItems(section.items),
      }))
      .filter(section => section.items.length > 0); // Remove empty sections
  };

  return {
    navbar: filterItems(unifiedNavConfig.navbar),
    sidebarSections: filterSections(unifiedNavConfig.sidebarSections),
  };
}

/**
 * Get navigation items for superadmin role
 */
export function getSuperadminNavItems(): {
  navbar: NavLinkConfig[];
  sidebarSections: NavSectionConfig[];
} {
  return getNavItemsForRole('superadmin');
}

/**
 * Get navigation items for platform admin role
 */
export function getPlatformAdminNavItems(permissions: Permission[] = []): {
  navbar: NavLinkConfig[];
  sidebarSections: NavSectionConfig[];
} {
  return getNavItemsForRole('admin', permissions);
}

/**
 * Get navigation items for HR role
 */
export function getHRNavItems(permissions: Permission[] = []): {
  navbar: NavLinkConfig[];
  sidebarSections: NavSectionConfig[];
} {
  return getNavItemsForRole('hr', permissions);
}

/**
 * Get navigation items for interviewer role
 */
export function getInterviewerNavItems(permissions: Permission[] = []): {
  navbar: NavLinkConfig[];
  sidebarSections: NavSectionConfig[];
} {
  return getNavItemsForRole('interviewer', permissions);
}

/**
 * Get navigation items for candidate role
 */
export function getCandidateNavItems(): {
  navbar: NavLinkConfig[];
  sidebarSections: NavSectionConfig[];
} {
  return getNavItemsForRole('candidate');
}