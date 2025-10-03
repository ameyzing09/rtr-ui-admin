'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
import { GenericSidebar } from '@/components/ui';

import { createDashboardSidebarConfig } from '@/config/dashboardSidebar';
import ClientOnly from '@/components/ClientOnly';
import { useAuth } from '@/components/auth/AuthProvider';
import { useClientPathnameWithFallback } from '@/hooks/useClientPathname';
import { useNavigation } from '@/hooks/useNavigation';
import { DEFAULT_VALUES } from '@/config/constants';
import type { UserRole } from '@/config/navigationConfig';

interface DashboardShellProps {
  children: React.ReactNode;
  tenantName?: string;
  tenantLogo?: string;
  environment?: 'dev' | 'staging' | 'prod';
}

const PLATFORM_BRANDING = {
  name: 'RTR Admin',
  logo: undefined as string | undefined,
  environment: process.env.NODE_ENV === 'development' ? 'dev' as const : undefined,
};

export default function DashboardShell({
  children,
  tenantName = 'Acme Corp',
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

  // Get navigation items from unified config
  const { navbar: rawNavbarItems } = useNavigation({
    userRole: navigationRole,
    userPermissions: permissions,
  });

  // Convert navbar items to legacy format for existing Navbar component
  const navbarItems = React.useMemo(() => 
    rawNavbarItems.map(item => ({
      label: item.label,
      href: item.href,
      icon: undefined, // Navbar doesn't use icons currently
      match: 'startsWith' as const,
    })),
    [rawNavbarItems]
  );

  const branding = React.useMemo(() => {
    if (navigationRole === 'superadmin') {
      return PLATFORM_BRANDING;
    }
    return {
      name: tenantName,
      logo: tenantLogo,
      environment,
    };
  }, [environment, navigationRole, tenantLogo, tenantName]);

  const sidebarConfig = React.useMemo(
    () =>
      createDashboardSidebarConfig({
        tenantName: branding.name,
        tenantLogo: branding.logo,
         userName: user?.name ?? DEFAULT_VALUES.USER_NAME,
         userEmail: user?.email ?? DEFAULT_VALUES.USER_EMAIL,
        userRole: role ?? undefined,
        currentPath: pathname,
        onLogout: () => {
          void logout();
        },
        userPermissions: permissions,
      }),
    [branding.name, branding.logo, logout, pathname, permissions, role, user],
  );

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
