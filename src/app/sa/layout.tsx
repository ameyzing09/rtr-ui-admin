'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';

/**
 * Check if user has valid superadmin session
 */
function checkSuperadminAuth(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // Check for stored session
    const sessionData = localStorage.getItem('rtr-admin-session');
    if (!sessionData) return false;

    const session = JSON.parse(sessionData);

    // Check if session has expired
    const expiresAt = new Date(session.expiresAt);
    if (expiresAt.getTime() <= Date.now()) {
      // Session expired, clear it
      localStorage.removeItem('rtr-admin-session');
      return false;
    }

    // Check if user is superadmin
    if (session.user?.role !== 'SUPERADMIN') {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking superadmin auth:', error);
    return false;
  }
}

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = checkSuperadminAuth();

    if (!isAuthenticated) {
      // Store current path for redirect after login
      sessionStorage.setItem('redirect_after_login', window.location.pathname);
      router.push('/sa/login');
    }
  }, [router]);

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
