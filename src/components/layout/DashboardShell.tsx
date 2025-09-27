'use client';

import React from 'react';
import Navbar from './Navbar';
import { GenericSidebar } from '@/components/ui';
import { buildNavbarItems } from '@/config/navigation';
import { createDashboardSidebarConfig } from '@/config/dashboardSidebar';
import ClientOnly from '@/components/ClientOnly';
import { useAuth } from '@/components/auth/AuthProvider';
import { useClientPathnameWithFallback } from '@/hooks/useClientPathname';

interface DashboardShellProps {
  children: React.ReactNode;
  tenantName?: string;
  tenantLogo?: string;
  environment?: 'dev' | 'staging' | 'prod';
}

export default function DashboardShell({
  children,
  tenantName = 'Acme Corp',
  tenantLogo,
  environment,
}: DashboardShellProps) {
  const pathname = useClientPathnameWithFallback('/dashboard');
  const { login, role, permissions } = useAuth();

  const navbarItems = React.useMemo(() => buildNavbarItems({ role, permissions }), [role, permissions]);

  const sidebarConfig = createDashboardSidebarConfig({
    tenantName,
    tenantLogo,
    userName: login.user.name,
    userEmail: login.user.email,
    userRole: role,
    currentPath: pathname,
    onLogout: () => {
      // TODO: Implement actual logout logic
      console.log('Logout clicked');
    },
    userPermissions: permissions,
  });

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-fg)]">
      {/* Top Navigation */}
      <Navbar
        navItems={navbarItems}
        tenantName={tenantName}
        tenantLogo={tenantLogo}
        environment={environment}
      />

      {/* Main Content Area */}
      <div className="flex w-full overflow-hidden">
        {/* Generic Sidebar - Wrapped in ClientOnly to prevent hydration issues */}
        <ClientOnly
          fallback={
            <div className="hidden lg:block w-64 bg-[var(--card)] border-r border-[var(--border)] h-screen">
              <div className="p-4">
                <div className="h-8 bg-[var(--muted)] rounded animate-pulse mb-4"></div>
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-6 bg-[var(--muted)] rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <GenericSidebar {...sidebarConfig} />
        </ClientOnly>

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-4 py-6 lg:px-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

