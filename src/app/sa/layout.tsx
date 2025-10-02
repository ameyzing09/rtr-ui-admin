import React from 'react';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';

// Mock auth check - replace with your actual auth logic
function checkSuperadminAuth() {
  // This is a server-side check
  // In a real app, you'd check the session/token here
  // For demo purposes, we'll assume auth is valid if we reach protected routes
  // The actual auth check would happen in middleware or here
  
  return true; // Mock: always authenticated for demo
}

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = checkSuperadminAuth();

  if (!isAuthenticated) {
    redirect('/sa/login');
  }

  // Platform/Superadmin branding
  const platformData = {
    name: 'RTR Admin Portal',
    logo: undefined, // TODO: Add platform logo URL if needed
    environment: process.env.NODE_ENV === 'development' ? 'dev' as const : undefined,
  };

  return (
    <DashboardShell
      tenantName={platformData.name}
      tenantLogo={platformData.logo}
      environment={platformData.environment}
    >
      {children}
    </DashboardShell>
  );
}