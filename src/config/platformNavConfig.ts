import type { Permission } from '@/lib/auth/types';

export type NavIconKey =
  | 'dashboard'
  | 'tenants'
  | 'users'
  | 'billing'
  | 'integrations'
  | 'health'
  | 'settings'
  | 'catalog'
  | 'security'
  | 'zap'
  | 'layers'
  | 'activity'
  | 'credit';

export type NavLinkConfig = {
  id: string;
  label: string;
  href: string;
  icon?: NavIconKey;
  permissions?: Permission[];
  requiredFlags?: string[];
};

export type NavSectionConfig = {
  id: string;
  title: string;
  permissions?: Permission[];
  items: NavLinkConfig[];
};

export const platformNavConfig = {
  navbar: <NavLinkConfig[]>[
    { id: 'overview', label: 'Overview', href: '/dashboard', icon: 'dashboard', permissions: ['platform:overview:view'] },
    { id: 'tenants', label: 'Tenants', href: '/dashboard/tenants', icon: 'layers', permissions: ['platform:tenants:manage'] },
    { id: 'users-access', label: 'Users & Access', href: '/dashboard/users', icon: 'users', permissions: ['platform:users:manage'] },
    { id: 'billing', label: 'Billing', href: '/dashboard/billing', icon: 'credit', permissions: ['platform:billing:manage'] },
    { id: 'integrations', label: 'Integrations', href: '/dashboard/integrations', icon: 'zap', permissions: ['platform:integrations:manage'] },
    { id: 'health', label: 'Health', href: '/dashboard/health', icon: 'activity', permissions: ['platform:health:view'] },
    { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: 'settings', permissions: ['platform:settings:manage'] },
  ],

  sidebarSections: <NavSectionConfig[]>[
    {
      id: 'overview',
      title: 'Overview',
      permissions: ['platform:overview:view'],
      items: [
        { id: 'overview-home', label: 'Overview', href: '/dashboard', icon: 'dashboard', permissions: ['platform:overview:view'] },
        { id: 'command-center', label: 'Command Center', href: '/dashboard/command-center', permissions: ['platform:overview:view'] },
        { id: 'global-search', label: 'Global Search', href: '/dashboard/search', permissions: ['platform:overview:view'] },
      ],
    },
    {
      id: 'tenants',
      title: 'Tenants',
      permissions: ['platform:tenants:manage'],
      items: [
        { id: 'tenants-all', label: 'All Tenants', href: '/sa/tenants', icon: 'layers', permissions: ['platform:tenants:manage'] },
        { id: 'tenants-onboarding', label: 'Onboarding Queue', href: '/sa/tenants/onboarding', permissions: ['platform:tenants:manage'], requiredFlags: ['TENANT_ONBOARDING_QUEUE'] },
        { id: 'tenants-create', label: 'Create Tenant', href: '/sa/tenants/new', permissions: ['platform:tenants:manage'] },
        { id: 'tenants-impersonate', label: 'Impersonate', href: '/dashboard/tenants/impersonate', permissions: ['platform:tenants:manage'] },
      ],
    },
    {
      id: 'users-access',
      title: 'Users & Access',
      permissions: ['platform:users:manage'],
      items: [
        { id: 'platform-users', label: 'Platform Users', href: '/dashboard/users', icon: 'users', permissions: ['platform:users:manage'] },
        { id: 'roles-perms', label: 'Roles & Permissions', href: '/dashboard/users/roles', permissions: ['platform:users:manage'] },
        { id: 'sso-providers', label: 'SSO Providers', href: '/dashboard/users/sso', permissions: ['platform:users:manage'] },
        { id: 'api-keys', label: 'API Keys (Platform)', href: '/dashboard/users/api-keys', permissions: ['platform:users:manage'] },
      ],
    },
    {
      id: 'billing',
      title: 'Billing',
      permissions: ['platform:billing:manage'],
      items: [
        { id: 'plans-pricing', label: 'Plans & Pricing', href: '/dashboard/billing/plans', icon: 'credit', permissions: ['platform:billing:manage'] },
        { id: 'subscriptions', label: 'Subscriptions', href: '/dashboard/billing/subscriptions', permissions: ['platform:billing:manage'] },
        { id: 'invoices-taxes', label: 'Invoices & Taxes', href: '/dashboard/billing/invoices', permissions: ['platform:billing:manage'] },
        { id: 'coupons', label: 'Coupons/Promos', href: '/dashboard/billing/coupons', permissions: ['platform:billing:manage'] },
      ],
    },
    {
      id: 'catalog-templates',
      title: 'Catalog & Templates',
      permissions: ['platform:catalog:manage'],
      items: [
        { id: 'pipeline-templates', label: 'Pipeline Templates', href: '/dashboard/catalog/pipelines', icon: 'catalog', permissions: ['platform:catalog:manage'] },
        { id: 'interview-kits', label: 'Interview Kits', href: '/dashboard/catalog/interviews', permissions: ['platform:catalog:manage'] },
        { id: 'job-schema', label: 'Job Schema', href: '/dashboard/catalog/job-schema', permissions: ['platform:catalog:manage'] },
        { id: 'email-sms-templates', label: 'Email/SMS Templates', href: '/dashboard/catalog/communications', permissions: ['platform:catalog:manage'] },
      ],
    },
    {
      id: 'integrations',
      title: 'Integrations (Platform)',
      permissions: ['platform:integrations:manage'],
      items: [
        { id: 'integration-catalog', label: 'Integration Catalog', href: '/dashboard/integrations', icon: 'zap', permissions: ['platform:integrations:manage'] },
        { id: 'providers-credentials', label: 'Providers & Credentials', href: '/dashboard/integrations/providers', permissions: ['platform:integrations:manage'] },
      ],
    },
    {
      id: 'adoption-health',
      title: 'Adoption & Health',
      permissions: ['platform:health:view'],
      items: [
        { id: 'webhooks-hub', label: 'Webhooks Hub', href: '/dashboard/health/webhooks', permissions: ['platform:health:view'] },
        { id: 'platform-health', label: 'Platform Health', href: '/dashboard/health/platform', icon: 'activity', permissions: ['platform:health:view'] },
        { id: 'service-health', label: 'Service Health', href: '/dashboard/health/services', permissions: ['platform:health:view'] },
        { id: 'queues-jobs', label: 'Queues & Jobs', href: '/dashboard/health/queues', permissions: ['platform:health:view'] },
        { id: 'rate-limits', label: 'Rate Limits', href: '/dashboard/health/rate-limits', permissions: ['platform:health:view'] },
      ],
    },
    {
      id: 'observability',
      title: 'Observability & Compliance',
      permissions: ['platform:observability:view'],
      items: [
        { id: 'audit-logs', label: 'Audit Logs', href: '/dashboard/obs/audit-logs', permissions: ['platform:observability:view'] },
        { id: 'activity-stream', label: 'Activity Stream', href: '/dashboard/obs/activity', permissions: ['platform:observability:view'] },
        { id: 'errors-alerts', label: 'Errors & Alerts', href: '/dashboard/obs/errors', permissions: ['platform:observability:view'] },
        { id: 'privacy-requests', label: 'Privacy Requests', href: '/dashboard/obs/privacy', permissions: ['platform:observability:view'] },
        { id: 'backups-restore', label: 'Backups & Restore', href: '/dashboard/obs/backups', permissions: ['platform:observability:view'] },
      ],
    },
    {
      id: 'experiments',
      title: 'Experiments & Flags',
      permissions: ['platform:experiments:view'],
      items: [
        { id: 'feature-flags', label: 'Feature Flags', href: '/dashboard/experiments/flags', permissions: ['platform:experiments:view'] },
        { id: 'ab-experiments', label: 'A/B Experiments', href: '/dashboard/experiments/ab', permissions: ['platform:experiments:view'] },
      ],
    },
    {
      id: 'ops-support',
      title: 'Ops & Support',
      permissions: ['platform:ops:view'],
      items: [
        { id: 'support-tickets', label: 'Support Tickets', href: '/dashboard/support/tickets', permissions: ['platform:ops:view'] },
        { id: 'announcements', label: 'Announcements', href: '/dashboard/support/announcements', permissions: ['platform:ops:view'] },
        { id: 'status-page', label: 'Status Page', href: '/dashboard/support/status', permissions: ['platform:ops:view'] },
      ],
    },
    {
      id: 'global-settings',
      title: 'Global Settings',
      permissions: ['platform:settings:manage'],
      items: [
        { id: 'platform-settings', label: 'Platform Settings', href: '/dashboard/settings', icon: 'settings', permissions: ['platform:settings:manage'] },
        { id: 'theming', label: 'Theming', href: '/dashboard/settings/theming', permissions: ['platform:settings:manage'] },
        { id: 'locales', label: 'Locales', href: '/dashboard/settings/locales', permissions: ['platform:settings:manage'] },
      ],
    },
  ],
} as const;
