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
import { PERMISSIONS, can } from '@/lib/rbac/permissions';

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
  // Navbar no longer contains global routes - it's for context controls only
  // Global navigation is handled by the sidebar
  navbar: <NavLinkConfig[]>[],

  sidebarSections: <NavSectionConfig[]>[
    // ========================================================================
    // Superadmin Sections (Control Plane)
    // ========================================================================
    // These are platform/multi-tenant concerns

    // 1. Tenants
    {
      id: 'tenants',
      title: 'Tenants',
      permission: PERMISSIONS.TENANT_LIST,
      requiredRole: 'superadmin',
      items: [
        {
          id: 'tenants-list',
          label: 'All Tenants',
          href: '/sa/tenants',
          icon: 'building',
          description: 'View and manage all tenants',
          permission: PERMISSIONS.TENANT_LIST,
          requiredRole: 'superadmin',
        },
        {
          id: 'tenants-onboarding',
          label: 'Onboarding Queue',
          href: '/sa/tenants/onboarding',
          icon: 'clock',
          description: 'Monitor tenant provisioning',
          permission: PERMISSIONS.TENANT_STATUS,
          requiredRole: 'superadmin',
          requiredFlags: ['TENANT_ONBOARDING_QUEUE'],
        },
        {
          id: 'tenants-create',
          label: 'Create Tenant',
          href: '/sa/tenants/create',
          icon: 'plus',
          description: 'Add new tenant',
          permission: PERMISSIONS.TENANT_CREATE,
          requiredRole: 'superadmin',
        },
        {
          id: 'tenants-impersonate',
          label: 'Impersonate',
          href: '/sa/tenants/impersonate',
          icon: 'usercheck',
          description: 'Impersonate tenant user',
          permission: PERMISSIONS.TENANT_IMPERSONATE,
          requiredRole: 'superadmin',
        },
      ],
    },

    // 2. Users & Access
    {
      id: 'users-access',
      title: 'Users & Access',
      permission: PERMISSIONS.SYS_USER_LIST,
      requiredRole: 'superadmin',
      items: [
        {
          id: 'platform-users',
          label: 'Platform Users',
          href: '/sa/users',
          icon: 'users',
          description: 'Manage platform ops users',
          permission: PERMISSIONS.SYS_USER_LIST,
          requiredRole: 'superadmin',
        },
        {
          id: 'user-roles',
          label: 'Roles & Permissions',
          href: '/sa/users/roles',
          icon: 'shield',
          description: 'Manage platform roles',
          permission: PERMISSIONS.SYS_USER_UPDATE,
          requiredRole: 'superadmin',
        },
        {
          id: 'api-keys',
          label: 'API Keys',
          href: '/sa/users/api-keys',
          icon: 'key',
          description: 'Platform API keys',
          permission: PERMISSIONS.SYS_USER_LIST,
          requiredRole: 'superadmin',
        },
      ],
    },

    // 3. Platform Billing
    {
      id: 'platform-billing',
      title: 'Platform Billing',
      permission: PERMISSIONS.PLATFORM_BILLING_READ,
      requiredRole: 'superadmin',
      items: [
        {
          id: 'billing-subscriptions',
          label: 'Subscriptions',
          href: '/sa/billing/subscriptions',
          icon: 'credit',
          description: 'Per-tenant subscription management',
          permission: PERMISSIONS.PLATFORM_BILLING_READ,
          requiredRole: 'superadmin',
        },
        {
          id: 'billing-plans',
          label: 'Plans & Pricing',
          href: '/sa/billing/plans',
          icon: 'catalog',
          description: 'Manage subscription plans',
          permission: PERMISSIONS.PLATFORM_BILLING_MANAGE,
          requiredRole: 'superadmin',
        },
        {
          id: 'billing-revenue',
          label: 'Revenue Dashboard',
          href: '/sa/billing/revenue',
          icon: 'chart',
          description: 'Platform revenue analytics',
          permission: PERMISSIONS.PLATFORM_BILLING_READ,
          requiredRole: 'superadmin',
        },
      ],
    },

    // 4. Catalog
    {
      id: 'catalog',
      title: 'Catalog',
      permission: PERMISSIONS.CATALOG_LIST,
      requiredRole: 'superadmin',
      items: [
        {
          id: 'catalog-plans',
          label: 'Plans & Features',
          href: '/sa/catalog/plans',
          icon: 'catalog',
          description: 'Global plans and features',
          permission: PERMISSIONS.CATALOG_LIST,
          requiredRole: 'superadmin',
        },
        {
          id: 'catalog-entitlements',
          label: 'Entitlements',
          href: '/sa/catalog/entitlements',
          icon: 'shield',
          description: 'Feature entitlements',
          permission: PERMISSIONS.CATALOG_READ,
          requiredRole: 'superadmin',
        },
        {
          id: 'catalog-templates',
          label: 'Templates',
          href: '/sa/catalog/templates',
          icon: 'file',
          description: 'Global templates',
          permission: PERMISSIONS.CATALOG_LIST,
          requiredRole: 'superadmin',
        },
      ],
    },

    // 5. Platform Integrations
    {
      id: 'platform-integrations',
      title: 'Platform Integrations',
      permission: PERMISSIONS.PLATFORM_INTEGRATIONS_LIST,
      requiredRole: 'superadmin',
      items: [
        {
          id: 'integrations-catalog',
          label: 'Integration Catalog',
          href: '/sa/integrations',
          icon: 'zap',
          description: 'Available integrations',
          permission: PERMISSIONS.PLATFORM_INTEGRATIONS_LIST,
          requiredRole: 'superadmin',
        },
        {
          id: 'integrations-connectors',
          label: 'Connectors',
          href: '/sa/integrations/connectors',
          icon: 'webhook',
          description: 'Platform-level connectors',
          permission: PERMISSIONS.PLATFORM_INTEGRATIONS_MANAGE,
          requiredRole: 'superadmin',
        },
        {
          id: 'integrations-credentials',
          label: 'Credentials',
          href: '/sa/integrations/credentials',
          icon: 'key',
          description: 'Integration credentials',
          permission: PERMISSIONS.PLATFORM_INTEGRATIONS_MANAGE,
          requiredRole: 'superadmin',
        },
      ],
    },

    // 6. Health
    {
      id: 'health',
      title: 'Health',
      permission: PERMISSIONS.SYS_HEALTH_READ,
      requiredRole: 'superadmin',
      items: [
        {
          id: 'health-services',
          label: 'Service Health',
          href: '/sa/health/services',
          icon: 'activity',
          description: 'Service uptime monitoring',
          permission: PERMISSIONS.SYS_HEALTH_READ,
          requiredRole: 'superadmin',
        },
        {
          id: 'health-queues',
          label: 'Worker Queues',
          href: '/sa/health/queues',
          icon: 'layers',
          description: 'Background job queues',
          permission: PERMISSIONS.SYS_HEALTH_READ,
          requiredRole: 'superadmin',
        },
        {
          id: 'health-status',
          label: 'Status Page',
          href: '/sa/health/status',
          icon: 'chart',
          description: 'Public status page',
          permission: PERMISSIONS.SYS_HEALTH_READ,
          requiredRole: 'superadmin',
        },
      ],
    },

    // 7. Observability
    {
      id: 'observability',
      title: 'Observability',
      permission: PERMISSIONS.OBSERVABILITY_READ,
      requiredRole: 'superadmin',
      items: [
        {
          id: 'obs-logs',
          label: 'Logs',
          href: '/sa/observability/logs',
          icon: 'file',
          description: 'System-wide logs',
          permission: PERMISSIONS.OBSERVABILITY_LOGS,
          requiredRole: 'superadmin',
        },
        {
          id: 'obs-traces',
          label: 'Traces',
          href: '/sa/observability/traces',
          icon: 'activity',
          description: 'Distributed tracing',
          permission: PERMISSIONS.OBSERVABILITY_TRACES,
          requiredRole: 'superadmin',
        },
        {
          id: 'obs-metrics',
          label: 'Metrics',
          href: '/sa/observability/metrics',
          icon: 'chart',
          description: 'System metrics',
          permission: PERMISSIONS.OBSERVABILITY_METRICS,
          requiredRole: 'superadmin',
        },
        {
          id: 'obs-audit',
          label: 'Audit Logs',
          href: '/sa/observability/audit',
          icon: 'archive',
          description: 'Cross-tenant audit logs',
          permission: PERMISSIONS.OBSERVABILITY_READ,
          requiredRole: 'superadmin',
        },
      ],
    },

    // 8. Experiments
    {
      id: 'experiments',
      title: 'Experiments',
      permission: PERMISSIONS.EXPERIMENTS_LIST,
      requiredRole: 'superadmin',
      items: [
        {
          id: 'experiments-flags',
          label: 'Feature Flags',
          href: '/sa/experiments/flags',
          icon: 'flag',
          description: 'Global feature flags',
          permission: PERMISSIONS.EXPERIMENTS_LIST,
          requiredRole: 'superadmin',
        },
        {
          id: 'experiments-ab',
          label: 'A/B Tests',
          href: '/sa/experiments/ab',
          icon: 'chart',
          description: 'A/B testing experiments',
          permission: PERMISSIONS.EXPERIMENTS_CREATE,
          requiredRole: 'superadmin',
        },
        {
          id: 'experiments-rollouts',
          label: 'Rollouts',
          href: '/sa/experiments/rollouts',
          icon: 'layers',
          description: 'Feature rollout management',
          permission: PERMISSIONS.EXPERIMENTS_UPDATE,
          requiredRole: 'superadmin',
        },
      ],
    },

    // 9. Ops Support
    {
      id: 'ops-support',
      title: 'Ops Support',
      permission: PERMISSIONS.OPS_SUPPORT_READ,
      requiredRole: 'superadmin',
      items: [
        {
          id: 'support-tickets',
          label: 'Support Tickets',
          href: '/sa/support/tickets',
          icon: 'ticket',
          description: 'Customer support tickets',
          permission: PERMISSIONS.OPS_SUPPORT_READ,
          requiredRole: 'superadmin',
        },
        {
          id: 'support-impersonation',
          label: 'Tenant Impersonation',
          href: '/sa/support/impersonate',
          icon: 'usercheck',
          description: 'Impersonate for support',
          permission: PERMISSIONS.OPS_SUPPORT_IMPERSONATE,
          requiredRole: 'superadmin',
        },
        {
          id: 'support-tools',
          label: 'Support Tools',
          href: '/sa/support/tools',
          icon: 'command',
          description: 'Admin support utilities',
          permission: PERMISSIONS.OPS_SUPPORT_READ,
          requiredRole: 'superadmin',
        },
      ],
    },

    // 10. Global Settings
    {
      id: 'global-settings',
      title: 'Global Settings',
      permission: PERMISSIONS.SETTINGS_GLOBAL,
      requiredRole: 'superadmin',
      items: [
        {
          id: 'settings-platform',
          label: 'Platform Settings',
          href: '/sa/settings',
          icon: 'settings',
          description: 'System configuration',
          permission: PERMISSIONS.SETTINGS_GLOBAL,
          requiredRole: 'superadmin',
        },
        {
          id: 'settings-branding',
          label: 'Branding',
          href: '/sa/settings/branding',
          icon: 'palette',
          description: 'Platform branding',
          permission: PERMISSIONS.SETTINGS_GLOBAL,
          requiredRole: 'superadmin',
        },
        {
          id: 'settings-mail',
          label: 'Mail Templates',
          href: '/sa/settings/mail',
          icon: 'mail',
          description: 'Email templates',
          permission: PERMISSIONS.SETTINGS_GLOBAL,
          requiredRole: 'superadmin',
        },
        {
          id: 'settings-security',
          label: 'Security Policies',
          href: '/sa/settings/security',
          icon: 'shield',
          description: 'Security configuration',
          permission: PERMISSIONS.SETTINGS_SECURITY,
          requiredRole: 'superadmin',
        },
        {
          id: 'settings-limits',
          label: 'Limits & Quotas',
          href: '/sa/settings/limits',
          icon: 'alert',
          description: 'Platform limits',
          permission: PERMISSIONS.SETTINGS_GLOBAL,
          requiredRole: 'superadmin',
        },
        {
          id: 'settings-database',
          label: 'Database',
          href: '/sa/settings/database',
          icon: 'database',
          description: 'Database management',
          permission: PERMISSIONS.SETTINGS_DB,
          requiredRole: 'superadmin',
        },
      ],
    },

    // ========================================================================
    // Tenant Dashboard Sections (Data Plane)
    // ========================================================================
    // Workflow-oriented navigation for HR/recruitment teams

    // 🧭 Overview
    {
      id: 'overview',
      title: 'Overview',
      permission: PERMISSIONS.ANALYTICS_READ,
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/dashboard',
          icon: 'dashboard',
          description: 'Active pipelines, candidate stats, job health',
          permission: PERMISSIONS.ANALYTICS_READ,
        },
      ],
    },

    // 📄 Recruitment (consolidated workflow)
    {
      id: 'recruitment',
      title: 'Recruitment',
      permission: PERMISSIONS.JOB_LIST,
      items: [
        {
          id: 'job-postings',
          label: 'Job Postings',
          href: '/dashboard/jobs',
          icon: 'file',
          description: 'Manage job openings',
          permission: PERMISSIONS.JOB_LIST,
        },
        {
          id: 'candidates',
          label: 'Candidates',
          href: '/dashboard/applications',
          icon: 'users',
          description: 'All applicants across jobs',
          permission: PERMISSIONS.APPLICATION_LIST,
        },
        {
          id: 'pipeline-view',
          label: 'Pipeline View',
          href: '/dashboard/pipeline',
          icon: 'layers',
          description: 'Visual drag-and-drop of stages',
          permission: PERMISSIONS.PIPELINE_LIST,
        },
      ],
    },

    // 🗓️ Interviews
    {
      id: 'interviews',
      title: 'Interviews',
      permission: PERMISSIONS.INTERVIEW_LIST,
      items: [
        {
          id: 'calendar',
          label: 'Calendar',
          href: '/dashboard/interviews',
          icon: 'clock',
          description: 'Upcoming & completed interviews',
          permission: PERMISSIONS.INTERVIEW_LIST,
        },
        {
          id: 'feedback',
          label: 'Feedback & Scores',
          href: '/dashboard/interviews/feedback',
          icon: 'file',
          description: 'Collect & review interview feedback',
          permission: PERMISSIONS.FEEDBACK_LIST,
        },
      ],
    },

    // 👥 Team
    {
      id: 'team',
      title: 'Team',
      permission: PERMISSIONS.MEMBER_LIST,
      items: [
        {
          id: 'members',
          label: 'Members',
          href: '/dashboard/team',
          icon: 'users',
          description: 'HR, recruiters, interviewers',
          permission: PERMISSIONS.MEMBER_LIST,
        },
        {
          id: 'permissions',
          label: 'Permissions',
          href: '/dashboard/team/roles',
          icon: 'shield',
          description: 'Control access levels',
          permission: PERMISSIONS.MEMBER_UPDATE,
        },
      ],
    },

    // 💼 Reports
    {
      id: 'reports',
      title: 'Reports',
      permission: PERMISSIONS.ANALYTICS_READ,
      items: [
        {
          id: 'hiring-metrics',
          label: 'Hiring Metrics',
          href: '/dashboard/reports/hiring',
          icon: 'chart',
          description: 'Time-to-hire, conversion rates',
          permission: PERMISSIONS.ANALYTICS_READ,
        },
        {
          id: 'source-analytics',
          label: 'Source Analytics',
          href: '/dashboard/reports/sources',
          icon: 'chart',
          description: 'Track candidate origins',
          permission: PERMISSIONS.ANALYTICS_READ,
        },
      ],
    },

    // ⚙️ Settings
    {
      id: 'settings',
      title: 'Settings',
      permission: PERMISSIONS.SETTINGS_READ,
      items: [
        {
          id: 'company',
          label: 'Company',
          href: '/dashboard/settings',
          icon: 'settings',
          description: 'General company settings',
          permission: PERMISSIONS.SETTINGS_READ,
        },
        {
          id: 'branding',
          label: 'Branding',
          href: '/dashboard/settings/branding',
          icon: 'palette',
          description: 'Logo, email templates, theme color',
          permission: PERMISSIONS.SETTINGS_UPDATE,
        },
        {
          id: 'billing',
          label: 'Billing',
          href: '/dashboard/settings/billing',
          icon: 'credit',
          description: 'Plan info & payments',
          permission: PERMISSIONS.BILLING_READ,
        },
        {
          id: 'integrations',
          label: 'Integrations',
          href: '/dashboard/settings/integrations',
          icon: 'zap',
          description: 'Slack, ATS, etc.',
          permission: PERMISSIONS.INTEGRATIONS_READ,
        },
        {
          id: 'statuses',
          label: 'Application Statuses',
          href: '/dashboard/settings/statuses',
          icon: 'flag',
          description: 'Configure tracking status options',
          permission: PERMISSIONS.SETTINGS_READ,
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

      // New permission-based check (single permission with wildcard support)
      if (item.permission) {
        return can(userPermissions, item.permission);
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

        // New permission-based check (single permission with wildcard support)
        if (section.permission) {
          return can(userPermissions, section.permission);
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