/**
 * Section Tabs Configuration
 *
 * Maps routes to their section-specific tabs.
 * These tabs appear in the navbar and change based on the current route.
 *
 * Unlike global navigation (which lives in the sidebar),
 * these are contextual sub-navigation within a section.
 */

export interface SectionTab {
  label: string;
  href: string;
  match?: 'exact' | 'startsWith';
}

/**
 * Get section tabs for a given pathname
 * Returns empty array if no tabs are defined for the route
 */
export function getSectionTabs(pathname: string): SectionTab[] {
  // Applications / Candidates section
  if (pathname.startsWith('/dashboard/applications')) {
    return [
      { label: 'All', href: '/dashboard/applications', match: 'exact' },
      { label: 'New', href: '/dashboard/applications?filter=new' },
      { label: 'Shortlisted', href: '/dashboard/applications?filter=shortlisted' },
      { label: 'Rejected', href: '/dashboard/applications?filter=rejected' },
    ];
  }

  // Jobs section
  if (pathname.startsWith('/dashboard/jobs')) {
    return [
      { label: 'Active', href: '/dashboard/jobs?status=active' },
      { label: 'Draft', href: '/dashboard/jobs?status=draft' },
      { label: 'Closed', href: '/dashboard/jobs?status=closed' },
    ];
  }

  // Interviews section
  if (pathname.startsWith('/dashboard/interviews')) {
    return [
      { label: 'Upcoming', href: '/dashboard/interviews?filter=upcoming' },
      { label: 'Completed', href: '/dashboard/interviews?filter=completed' },
      { label: 'Feedback', href: '/dashboard/interviews/feedback' },
    ];
  }

  // Team section
  if (pathname.startsWith('/dashboard/team')) {
    return [
      { label: 'Members', href: '/dashboard/team', match: 'exact' },
      { label: 'Permissions', href: '/dashboard/team/roles' },
    ];
  }

  // Reports section
  if (pathname.startsWith('/dashboard/reports')) {
    return [
      { label: 'Hiring', href: '/dashboard/reports/hiring' },
      { label: 'Sources', href: '/dashboard/reports/sources' },
    ];
  }

  // Settings section
  if (pathname.startsWith('/dashboard/settings')) {
    return [
      { label: 'Company', href: '/dashboard/settings', match: 'exact' },
      { label: 'Branding', href: '/dashboard/settings/branding' },
      { label: 'Billing', href: '/dashboard/settings/billing' },
      { label: 'Integrations', href: '/dashboard/settings/integrations' },
    ];
  }

  // Superadmin: Tenants section
  if (pathname.startsWith('/sa/tenants')) {
    return [
      { label: 'All Tenants', href: '/sa/tenants', match: 'exact' },
      { label: 'Onboarding', href: '/sa/tenants/onboarding' },
      { label: 'Create', href: '/sa/tenants/create' },
    ];
  }

  // Superadmin: Users section
  if (pathname.startsWith('/sa/users')) {
    return [
      { label: 'Platform Users', href: '/sa/users', match: 'exact' },
      { label: 'Roles', href: '/sa/users/roles' },
      { label: 'API Keys', href: '/sa/users/api-keys' },
    ];
  }

  // Superadmin: Settings section
  if (pathname.startsWith('/sa/settings')) {
    return [
      { label: 'Platform', href: '/sa/settings', match: 'exact' },
      { label: 'Branding', href: '/sa/settings/branding' },
      { label: 'Mail Templates', href: '/sa/settings/mail' },
      { label: 'Security', href: '/sa/settings/security' },
      { label: 'Limits', href: '/sa/settings/limits' },
      { label: 'Database', href: '/sa/settings/database' },
    ];
  }

  // No tabs for this route
  return [];
}

/**
 * Get the current section name from pathname
 * Used for mobile breadcrumbs or section headers
 */
export function getCurrentSection(pathname: string): string {
  if (pathname.startsWith('/dashboard/applications')) return 'Candidates';
  if (pathname.startsWith('/dashboard/jobs')) return 'Jobs';
  if (pathname.startsWith('/dashboard/interviews')) return 'Interviews';
  if (pathname.startsWith('/dashboard/team')) return 'Team';
  if (pathname.startsWith('/dashboard/reports')) return 'Reports';
  if (pathname.startsWith('/dashboard/settings')) return 'Settings';
  if (pathname.startsWith('/dashboard/pipeline')) return 'Pipeline';
  if (pathname.startsWith('/sa/tenants')) return 'Tenants';
  if (pathname.startsWith('/sa/users')) return 'Users & Access';
  if (pathname.startsWith('/sa/settings')) return 'Global Settings';
  if (pathname.startsWith('/sa/billing')) return 'Platform Billing';
  if (pathname.startsWith('/sa/catalog')) return 'Catalog';
  if (pathname.startsWith('/sa/integrations')) return 'Platform Integrations';
  if (pathname.startsWith('/sa/health')) return 'Health';
  if (pathname.startsWith('/sa/observability')) return 'Observability';
  if (pathname.startsWith('/sa/experiments')) return 'Experiments';
  if (pathname.startsWith('/sa/support')) return 'Ops Support';
  if (pathname === '/dashboard') return 'Overview';
  return '';
}
