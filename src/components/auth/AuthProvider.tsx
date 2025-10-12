'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { authClient } from '@/lib/api/authClient';
import { fetcher } from '@/lib/api/fetcher';
import { getTenantHeaders } from '@/config/env';
import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  StoredAuthSession,
  UserRole,
} from '@/lib/auth/types';
import type { Permission } from '@/lib/rbac/permissions';
import { audit } from '@/lib/audit/log';
import { setSessionCookieAction, clearSessionCookieAction } from '@/lib/actions/auth';

interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  role: UserRole | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  availableRoles: UserRole[];
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'rtr-admin-session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') {
        return;
      }

      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setIsLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(stored) as StoredAuthSession;
        const expiresAt = new Date(parsed.expiresAt);

        if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
          window.sessionStorage.removeItem(STORAGE_KEY);
          setIsLoading(false);
          return;
        }

        const normalized: AuthSession = {
          token: parsed.token,
          expiresAt,
          user: parsed.user,
          branding: parsed.branding,
        };

        setSession(normalized);
        fetcher.setAuthToken(normalized.token);

        // In local environment, use environment tenant headers if available, otherwise use user's tenant ID
        const isLocalEnv = process.env.NEXT_PUBLIC_LOCAL_MODE === 'true' || process.env.NODE_ENV === 'development';

        if (isLocalEnv) {
          const tenantHeaders = await getTenantHeaders();
          if (Object.keys(tenantHeaders).length > 0) {
            // Use environment tenant headers
            if (tenantHeaders['X-Tenant-ID']) {
              fetcher.setTenantId(tenantHeaders['X-Tenant-ID']);
            }
            if (tenantHeaders['X-Tenant-Ts']) {
              fetcher.setTenantTs(tenantHeaders['X-Tenant-Ts']);
            }
            if (tenantHeaders['X-Tenant-Sig']) {
              fetcher.setTenantSig(tenantHeaders['X-Tenant-Sig']);
            }
          } else {
            // Fall back to user's tenant ID
            fetcher.setTenantId(normalized.user.tenantId);
          }
        } else {
          // Use user's tenant ID
          fetcher.setTenantId(normalized.user.tenantId);
        }

        // Set session cookie for middleware authentication (using Server Action)
        try {
          await setSessionCookieAction(parsed);
        } catch (error) {
          console.error('Failed to set session cookie on init:', error);
          // Don't fail initialization if cookie setting fails
        }
      } catch {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const nextSession = await authClient.login(credentials);
      setSession(nextSession);
      fetcher.setAuthToken(nextSession.token);

      // In local environment, use environment tenant headers if available, otherwise use user's tenant ID
      const isLocalEnv = process.env.NEXT_PUBLIC_LOCAL_MODE === 'true' || process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        const tenantHeaders = await getTenantHeaders();
        console.log('Using tenant headers:', tenantHeaders);
        if (Object.keys(tenantHeaders).length > 0) {
          // Use environment tenant headers
          if (tenantHeaders['X-Tenant-ID']) {
            fetcher.setTenantId(tenantHeaders['X-Tenant-ID']);
          }
          if (tenantHeaders['X-Tenant-Ts']) {
            fetcher.setTenantTs(tenantHeaders['X-Tenant-Ts']);
          }
          if (tenantHeaders['X-Tenant-Sig']) {
            fetcher.setTenantSig(tenantHeaders['X-Tenant-Sig']);
          }
        } else {
          // Fall back to user's tenant ID
          fetcher.setTenantId(nextSession.user.tenantId);
        }
      } else {
        // Use user's tenant ID
        fetcher.setTenantId(nextSession.user.tenantId);
      }

      if (typeof window !== 'undefined') {
        const persist: StoredAuthSession = {
          token: nextSession.token,
          expiresAt: nextSession.expiresAt.toISOString(),
          user: nextSession.user,
          branding: nextSession.branding,
        };

        // Always store in sessionStorage for client-side access
        // (rememberMe only affects cookie persistence, not sessionStorage)
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persist));

        // Set session cookie for middleware authentication (using Server Action)
        try {
          await setSessionCookieAction(persist);
        } catch (error) {
          console.error('Failed to set session cookie:', error);
          // Don't fail login if cookie setting fails
        }
      }
    } catch (cause) {
      let message = 'Unable to sign in. Please check your credentials.';
      if (cause instanceof Error && cause.message) {
        message = cause.message;
      }
      setError(message);
      throw cause;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Only call logout API if we have a valid session
      if (session?.user) {
        // Determine audience based on current role
        const audience = session.user.role === 'SUPERADMIN' ? 'platform' : 'tenant';
        
        // In local environment, use environment tenant headers if available, otherwise use user's tenant ID
        const isLocalEnv = process.env.NEXT_PUBLIC_LOCAL_MODE === 'true' || process.env.NODE_ENV === 'development';
        
        let tenantId: string;
        if (isLocalEnv) {
          const tenantHeaders = await getTenantHeaders();
          if (tenantHeaders['X-Tenant-ID']) {
            tenantId = tenantHeaders['X-Tenant-ID'];
          } else {
            tenantId = session.user.tenantId;
          }
        } else {
          tenantId = session.user.tenantId;
        }
        
        // Call backend logout API
        await authClient.logout({ audience, tenantId });

        // Audit successful logout
        audit('auth.logout', {
          actorId: session.user.id,
          actorEmail: session.user.email,
          actorRole: session.user.role,
          tenantId: session.user.tenantId,
          status: 'success',
          details: {
            audience,
          },
        }).catch(error => {
          console.error('Failed to audit logout:', error);
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Always clear local state
      setSession(null);
      setError(null);
      fetcher.removeAuthToken();
      fetcher.removeTenantId();

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(STORAGE_KEY);

        // Clear session cookie (using Server Action)
        try {
          await clearSessionCookieAction();
        } catch (error) {
          console.error('Failed to clear session cookie:', error);
          // Don't fail logout if cookie clearing fails
        }
      }
    }
  }, [session]);

  const role = session?.user.role ?? null;
  const permissions = useMemo<Permission[]>(() => {
    // Use permissions from backend JWT (already in session.user.permissions)
    return session?.user.permissions ?? [];
  }, [session?.user.permissions]);

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    session,
    role,
    permissions,
    isAuthenticated: Boolean(session),
    isLoading,
    error,
    login,
    logout,
    availableRoles: role ? [role] : [],
  }), [session, role, permissions, isLoading, error, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


