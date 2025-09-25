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
};

export type NavSectionConfig = {
  id: string;
  title: string;
  items: NavLinkConfig[];
};

export const platformNavConfig = {
  navbar: <NavLinkConfig[]>[
    { id: 'overview', label: 'Overview', href: '/dashboard', icon: 'dashboard' },
    { id: 'tenants', label: 'Tenants', href: '/dashboard/tenants', icon: 'layers' },
    { id: 'users-access', label: 'Users & Access', href: '/dashboard/users', icon: 'users' },
    { id: 'billing', label: 'Billing', href: '/dashboard/billing', icon: 'credit' },
    { id: 'integrations', label: 'Integrations', href: '/dashboard/integrations', icon: 'zap' },
    { id: 'health', label: 'Health', href: '/dashboard/health', icon: 'activity' },
    { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
  ],

  sidebarSections: <NavSectionConfig[]>[
    {
      id: 'overview',
      title: 'Overview',
      items: [
        { id: 'overview-home', label: 'Overview', href: '/dashboard', icon: 'dashboard' },
        { id: 'command-center', label: 'Command Center', href: '/dashboard/command-center' },
        { id: 'global-search', label: 'Global Search', href: '/dashboard/search' },
      ],
    },
    {
      id: 'tenants',
      title: 'Tenants',
      items: [
        { id: 'tenants-all', label: 'All Tenants', href: '/dashboard/tenants', icon: 'layers' },
        { id: 'tenants-onboarding', label: 'Onboarding Queue', href: '/dashboard/tenants/onboarding' },
        { id: 'tenants-create', label: 'Create Tenant', href: '/dashboard/tenants/create' },
        { id: 'tenants-impersonate', label: 'Impersonate', href: '/dashboard/tenants/impersonate' },
      ],
    },
    {
      id: 'users-access',
      title: 'Users & Access',
      items: [
        { id: 'platform-users', label: 'Platform Users', href: '/dashboard/users', icon: 'users' },
        { id: 'roles-perms', label: 'Roles & Permissions', href: '/dashboard/users/roles' },
        { id: 'sso-providers', label: 'SSO Providers', href: '/dashboard/users/sso' },
        { id: 'api-keys', label: 'API Keys (Platform)', href: '/dashboard/users/api-keys' },
      ],
    },
    {
      id: 'billing',
      title: 'Billing',
      items: [
        { id: 'plans-pricing', label: 'Plans & Pricing', href: '/dashboard/billing/plans', icon: 'credit' },
        { id: 'subscriptions', label: 'Subscriptions', href: '/dashboard/billing/subscriptions' },
        { id: 'invoices-taxes', label: 'Invoices & Taxes', href: '/dashboard/billing/invoices' },
        { id: 'coupons', label: 'Coupons/Promos', href: '/dashboard/billing/coupons' },
      ],
    },
    {
      id: 'catalog-templates',
      title: 'Catalog & Templates',
      items: [
        { id: 'pipeline-templates', label: 'Pipeline Templates', href: '/dashboard/catalog/pipelines', icon: 'catalog' },
        { id: 'interview-kits', label: 'Interview Kits', href: '/dashboard/catalog/interviews' },
        { id: 'job-schema', label: 'Job Schema', href: '/dashboard/catalog/job-schema' },
        { id: 'email-sms-templates', label: 'Email/SMS Templates', href: '/dashboard/catalog/communications' },
      ],
    },
    {
      id: 'integrations',
      title: 'Integrations (Platform)',
      items: [
        { id: 'integration-catalog', label: 'Integration Catalog', href: '/dashboard/integrations', icon: 'zap' },
        { id: 'providers-credentials', label: 'Providers & Credentials', href: '/dashboard/integrations/providers' },
      ],
    },
    {
      id: 'adoption-health',
      title: 'Adoption & Health',
      items: [
        { id: 'webhooks-hub', label: 'Webhooks Hub', href: '/dashboard/health/webhooks' },
        { id: 'platform-health', label: 'Platform Health', href: '/dashboard/health/platform', icon: 'activity' },
        { id: 'service-health', label: 'Service Health', href: '/dashboard/health/services' },
        { id: 'queues-jobs', label: 'Queues & Jobs', href: '/dashboard/health/queues' },
        { id: 'rate-limits', label: 'Rate Limits', href: '/dashboard/health/rate-limits' },
      ],
    },
    {
      id: 'observability',
      title: 'Observability & Compliance',
      items: [
        { id: 'audit-logs', label: 'Audit Logs', href: '/dashboard/obs/audit-logs' },
        { id: 'activity-stream', label: 'Activity Stream', href: '/dashboard/obs/activity' },
        { id: 'errors-alerts', label: 'Errors & Alerts', href: '/dashboard/obs/errors' },
        { id: 'privacy-requests', label: 'Privacy Requests', href: '/dashboard/obs/privacy' },
        { id: 'backups-restore', label: 'Backups & Restore', href: '/dashboard/obs/backups' },
      ],
    },
    {
      id: 'experiments',
      title: 'Experiments & Flags',
      items: [
        { id: 'feature-flags', label: 'Feature Flags', href: '/dashboard/experiments/flags' },
        { id: 'ab-experiments', label: 'A/B Experiments', href: '/dashboard/experiments/ab' },
      ],
    },
    {
      id: 'ops-support',
      title: 'Ops & Support',
      items: [
        { id: 'support-tickets', label: 'Support Tickets', href: '/dashboard/support/tickets' },
        { id: 'announcements', label: 'Announcements', href: '/dashboard/support/announcements' },
        { id: 'status-page', label: 'Status Page', href: '/dashboard/support/status' },
      ],
    },
    {
      id: 'global-settings',
      title: 'Global Settings',
      items: [
        { id: 'platform-settings', label: 'Platform Settings', href: '/dashboard/settings', icon: 'settings' },
        { id: 'theming', label: 'Theming', href: '/dashboard/settings/theming' },
        { id: 'locales', label: 'Locales', href: '/dashboard/settings/locales' },
      ],
    },
  ],
} as const;
