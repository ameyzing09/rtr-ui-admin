'use client';

import React, { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import type { PlatformBranding } from '@/lib/auth/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface SessionData {
  user?: { role: string };
  expiresAt: string;
  branding?: PlatformBranding;
}

/**
 * Get tenant session data including branding
 */
function getTenantSession(): SessionData | null {
  if (typeof window === 'undefined') return null;

  try {
    const sessionData = localStorage.getItem('rtr-admin-session');
    if (!sessionData) return null;

    const session = JSON.parse(sessionData) as SessionData;

    // Check if session has expired
    const expiresAt = new Date(session.expiresAt);
    if (expiresAt.getTime() <= Date.now()) {
      localStorage.removeItem('rtr-admin-session');
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error getting tenant session:', error);
    return null;
  }
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  useEffect(() => {
    const session = getTenantSession();
    if (session) {
      setSessionData(session);
    }
  }, []);

  // Use branding from session, fallback to defaults
  const branding = sessionData?.branding;
  console.log('Dashboard Layout - Session Data:', sessionData);
  console.log('Dashboard Layout - Branding:', branding);
  const tenantData = {
    name: branding?.navbar_title || branding?.name || 'Acme Corp',
    logo: branding?.logo_url,
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
