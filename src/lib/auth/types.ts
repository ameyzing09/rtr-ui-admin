import type { Permission } from '@/lib/rbac/permissions';

// Re-export Permission for convenience
export type { Permission };

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'HR' | 'INTERVIEWER' | 'CANDIDATE';

export interface AuthUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  mustChangePassword: boolean;
  permissions: Permission[];
}

// Branding information returned by backend
// - TenantBranding for tenant user logins
// - PlatformBranding for superadmin logins
export interface PlatformBranding {
  name: string;
  logo_url?: string;
  primary_color?: string;
  accent_color?: string;
  navbar_title?: string;
  sidebar_title?: string;
}

export interface AuthSession {
  token: string;
  expiresAt: Date;
  user: AuthUser;
  branding?: PlatformBranding;
}

export interface StoredAuthSession extends Omit<AuthSession, 'expiresAt'> {
  expiresAt: string;
  branding?: PlatformBranding;
}

export type LoginAudience = 'tenant' | 'platform';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  audience?: LoginAudience;
}

// Permission type now imported from @/lib/rbac/permissions
