'use client';

import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { useAuth } from '@/components/auth/AuthProvider';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { session, isLoading } = useAuth();

  // Use branding from AuthProvider session
  // Backend returns TenantBranding for tenant users, PlatformBranding for superadmins
  const branding = session?.branding;

  const tenantData = {
    name: branding?.navbar_title || branding?.name || 'Dashboard',
    logo: branding?.logo_url,
    environment: process.env.NODE_ENV === 'development' ? 'dev' as const : undefined,
  };

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] text-[var(--app-fg)]">
        <div className="glass-pill px-8 py-6 text-center shadow-lg">
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell
      tenantName={tenantData.name}
      tenantLogo={tenantData.logo}
      environment={tenantData.environment}
    >
      {children}
    </DashboardShell>
  );
}
