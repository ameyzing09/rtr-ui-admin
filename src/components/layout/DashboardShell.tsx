'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, HelpCircle } from 'lucide-react';
import Navbar from './Navbar';
import { GenericSidebar } from '@/components/ui';
import type { NavigationSection, SidebarProps } from '@/components/ui/Sidebar';
import { createNavigationLink, createNavigationButton, markActiveSections } from '@/components/ui/Sidebar/helpers';

import ClientOnly from '@/components/ClientOnly';
import { useAuth } from '@/components/auth/AuthProvider';
import { useClientPathnameWithFallback } from '@/hooks/useClientPathname';
import { useNavigation } from '@/hooks/useNavigation';
import { DEFAULT_VALUES } from '@/config/constants';
import type { UserRole } from '@/config/navigationConfig';
import { getIcon } from '@/config/navigationConfig';

interface DashboardShellProps {
  children: React.ReactNode;
  tenantName?: string;
  tenantLogo?: string;
  environment?: 'dev' | 'staging' | 'prod';
}

export default function DashboardShell({
  children,
  tenantName = 'Dashboard',
  tenantLogo,
  environment,
}: DashboardShellProps) {
  const router = useRouter();
  const pathname = useClientPathnameWithFallback('/dashboard');
  const { user, role, permissions, isAuthenticated, isLoading, logout } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Map auth role to navigation role
  const navigationRole: UserRole = React.useMemo(() => {
    switch (role) {
      case 'SUPERADMIN':
        return 'superadmin';
      case 'ADMIN':
        return 'admin';
      case 'HR':
        return 'hr';
      case 'INTERVIEWER':
        return 'interviewer';
      case 'CANDIDATE':
        return 'candidate';
      default:
        return 'candidate';
    }
  }, [role]);

  // Get navigation items from unified config (sidebar only - navbar is context-based)
  const { sidebarSections: rawSidebarSections } = useNavigation({
    userRole: navigationRole,
    userPermissions: permissions,
  });

  // Navbar items are now empty - navbar shows context controls, not global routes
  const navbarItems = React.useMemo(() => [], []);

  // Always use the props passed from the layout (which includes dynamic branding from backend)
  const branding = React.useMemo(() => ({
    name: tenantName,
    logo: tenantLogo,
    environment,
  }), [environment, tenantLogo, tenantName]);

  // Create sidebar config from unified navigation config
  const sidebarConfig: SidebarProps = React.useMemo(() => {
    // Convert unified navigation sections to sidebar format
    const sections: NavigationSection[] = rawSidebarSections.map((section) => ({
      id: section.id,
      title: section.title,
      items: section.items.map((item) => {
        const parts = item.href.split('/').filter(Boolean);
        const exact = parts.length <= 2;
        return createNavigationLink({
          id: item.id,
          label: item.label,
          href: item.href,
          icon: item.icon ? getIcon(item.icon) : undefined,
          exactMatch: exact,
          description: item.description,
        });
      }),
    }));

    return {
      sections: markActiveSections(sections, pathname),

      header: {
        title: branding.name,
        subtitle: navigationRole === 'superadmin' ? 'Super Admin' : 'Admin Dashboard',
        logo: branding.logo
          ? {
              src: branding.logo,
              alt: `${branding.name} logo`,
            }
          : undefined,
      },

      footer: {
        user: {
          name: user?.name ?? DEFAULT_VALUES.USER_NAME,
          email: user?.email ?? DEFAULT_VALUES.USER_EMAIL,
          role: role ?? 'User',
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
            onClick: () => {
              void logout();
            },
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
  }, [rawSidebarSections, pathname, branding, navigationRole, user, role, logout]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] text-[var(--app-fg)]">
        <div className="glass-pill px-8 py-6 text-center shadow-lg">
          <p className="text-sm text-gray-400">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-fg)]">
      <Navbar
        navItems={navbarItems}
        tenantName={branding.name}
        tenantLogo={branding.logo}
        environment={branding.environment}
      />

      <div className="flex w-full overflow-hidden">
        <ClientOnly
          fallback={
            <div className="hidden lg:block w-64 bg-[var(--card)] border-r border-[var(--border)] h-screen">
              <div className="p-4">
                <div className="h-8 bg-[var(--muted)] rounded animate-pulse mb-4" />
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-6 bg-[var(--muted)] rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <GenericSidebar {...sidebarConfig} />
        </ClientOnly>

        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-4 py-6 lg:px-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
