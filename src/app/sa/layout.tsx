'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import { useAuth } from '@/components/auth/AuthProvider';

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { session, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to initialize
    if (isLoading) return;

    // Check if user is authenticated and is a superadmin
    if (!isAuthenticated || !session?.user) {
      // Store current path for redirect after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirect_after_login', window.location.pathname);
      }
      router.push('/login');
      return;
    }

    // If authenticated but not superadmin, redirect to unauthorized
    if (session.user.role !== 'SUPERADMIN') {
      router.push('/unauthorized?reason=role');
    }
  }, [isAuthenticated, isLoading, router, session]);

  // Use branding from AuthProvider session
  const branding = session?.branding;
  const platformData = {
    name: branding?.navbar_title || branding?.name || 'RTR Admin Portal',
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

  // Don't render if not authenticated (redirect will happen via useEffect)
  if (!isAuthenticated || !session?.user || session.user.role !== 'SUPERADMIN') {
    return null;
  }

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
