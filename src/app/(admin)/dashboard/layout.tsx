import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // TODO: Replace with actual tenant data from your auth/tenant system
  const tenantData = {
    name: 'Acme Corp',
    logo: undefined, // TODO: Add tenant logo URL
    environment: process.env.NODE_ENV === 'development' ? 'dev' as const : undefined,
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
