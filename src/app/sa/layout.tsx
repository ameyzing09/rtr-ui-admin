'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import type { PlatformBranding } from '@/lib/auth/types';

interface SessionData {
  user?: { role: string };
  expiresAt: string;
  branding?: PlatformBranding;
}

/**
 * Check if user has valid superadmin session and return session data
 */
function getSuperadminSession(): SessionData | null {
  if (typeof window === 'undefined') return null;

  try {
    // Check for stored session
    const sessionData = localStorage.getItem('rtr-admin-session');
    if (!sessionData) return null;

    const session = JSON.parse(sessionData) as SessionData;

    // Check if session has expired
    const expiresAt = new Date(session.expiresAt);
    if (expiresAt.getTime() <= Date.now()) {
      // Session expired, clear it
      localStorage.removeItem('rtr-admin-session');
      return null;
    }

    // Check if user is superadmin
    if (session.user?.role !== 'SUPERADMIN') {
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error checking superadmin auth:', error);
    return null;
  }
}

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  useEffect(() => {
    const session = getSuperadminSession();

    if (!session) {
      // Store current path for redirect after login
      sessionStorage.setItem('redirect_after_login', window.location.pathname);
      router.push('/sa/login');
    } else {
      setSessionData(session);
    }
  }, [router]);

  // Use branding from session, fallback to defaults
  const branding = sessionData?.branding;
  console.log('Branding:', branding);
  const platformData = {
    name: branding?.navbar_title || branding?.name || 'RTR Admin Portal',
    logo: branding?.logo_url,
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
