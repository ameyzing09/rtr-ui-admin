import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';

interface DemoDashboardLayoutProps {
  children: React.ReactNode;
}

export default function DemoDashboardLayout({ children }: DemoDashboardLayoutProps) {
  const tenantData = {
    name: 'RecruTR (Demo Tenant)',
    logo: undefined as string | undefined,
    environment: process.env.NODE_ENV === 'development' ? ('dev' as const) : undefined,
  };

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

