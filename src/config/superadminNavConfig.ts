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
} from 'lucide-react';

export type SuperadminNavIconKey =
  | 'users'
  | 'building'
  | 'plus'
  | 'clock'
  | 'shield'
  | 'settings'
  | 'chart'
  | 'database'
  | 'activity';

const iconMap: Record<SuperadminNavIconKey, LucideIcon> = {
  users: Users,
  building: Building,
  plus: Plus,
  clock: Clock,
  shield: Shield,
  settings: Settings,
  chart: BarChart3,
  database: Database,
  activity: Activity,
};

export type SuperadminNavLinkConfig = {
  id: string;
  label: string;
  href: string;
  icon?: SuperadminNavIconKey;
  description?: string;
  requiredFlags?: string[];
};

export type SuperadminNavSectionConfig = {
  id: string;
  title: string;
  items: SuperadminNavLinkConfig[];
};

export const superadminNavConfig = {
  sidebarSections: [
    {
      id: 'tenant-management',
      title: 'Tenant Management',
      items: [
        {
          id: 'all-tenants',
          label: 'All Tenants',
          href: '/sa/tenants',
          icon: 'building' as SuperadminNavIconKey,
          description: 'View and manage all tenants',
        },
        {
          id: 'onboarding-queue',
          label: 'Onboarding Queue',
          href: '/sa/tenants/onboarding',
          icon: 'clock' as SuperadminNavIconKey,
          description: 'Monitor tenant provisioning',
          requiredFlags: ['TENANT_ONBOARDING_QUEUE'],
        },
        {
          id: 'create-tenant',
          label: 'Create Tenant',
          href: '/sa/tenants/create',
          icon: 'plus' as SuperadminNavIconKey,
          description: 'Add new tenant',
        },
      ],
    },
    {
      id: 'system-management',
      title: 'System Management',
      items: [
        {
          id: 'system-users',
          label: 'System Users',
          href: '/sa/users',
          icon: 'users' as SuperadminNavIconKey,
          description: 'Manage system administrators',
        },
        {
          id: 'system-health',
          label: 'System Health',
          href: '/sa/health',
          icon: 'activity' as SuperadminNavIconKey,
          description: 'Monitor system status',
        },
        {
          id: 'analytics',
          label: 'Analytics',
          href: '/sa/analytics',
          icon: 'chart' as SuperadminNavIconKey,
          description: 'System-wide analytics',
        },
      ],
    },
    {
      id: 'configuration',
      title: 'Configuration',
      items: [
        {
          id: 'global-settings',
          label: 'Global Settings',
          href: '/sa/settings',
          icon: 'settings' as SuperadminNavIconKey,
          description: 'System configuration',
        },
        {
          id: 'security',
          label: 'Security',
          href: '/sa/security',
          icon: 'shield' as SuperadminNavIconKey,
          description: 'Security policies',
        },
        {
          id: 'database',
          label: 'Database',
          href: '/sa/database',
          icon: 'database' as SuperadminNavIconKey,
          description: 'Database management',
        },
      ],
    },
  ] as SuperadminNavSectionConfig[],
};

export function getSuperadminIcon(iconKey: SuperadminNavIconKey): LucideIcon {
  return iconMap[iconKey];
}