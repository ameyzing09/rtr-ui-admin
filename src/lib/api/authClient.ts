import { z } from 'zod';
import { fetcher } from './fetcher';
import { env } from '@/config/env';
import type { AuthSession, AuthUser, LoginCredentials, LoginAudience } from '@/lib/auth/types';
import type { Permission } from '@/lib/rbac/permissions';
import { audit } from '@/lib/audit/log';

const apiUserSchema = z.object({
  ID: z.string(),
  TenantID: z.string(),
  Name: z.string(),
  Email: z.string().email(),
  Role: z.enum(['SUPERADMIN', 'ADMIN', 'HR', 'INTERVIEWER', 'CANDIDATE']),
  MustChangePassword: z.boolean().default(false),
  Permissions: z.array(z.string()).default([]), // Backend sends permissions array
});

const platformBrandingSchema = z.object({
  name: z.string(),
  logo_url: z.string().optional(),
  primary_color: z.string().optional(),
  accent_color: z.string().optional(),
  navbar_title: z.string().optional(),
  sidebar_title: z.string().optional(),
  // Ignoring sidebar_links as frontend has its own navigation structure
}).optional();

const loginResponseSchema = z.object({
  Token: z.string(),
  ExpiresAt: z.string(),
  User: apiUserSchema,
  PlatformBranding: platformBrandingSchema,
});

type LoginApiResponse = z.infer<typeof loginResponseSchema>;

function mapUser(user: LoginApiResponse['User']): AuthUser {
  return {
    id: user.ID,
    tenantId: user.TenantID,
    name: user.Name,
    email: user.Email,
    role: user.Role,
    mustChangePassword: user.MustChangePassword ?? false,
    permissions: (user.Permissions || []) as Permission[], // Use permissions from backend JWT
  };
}

function mapSession(payload: LoginApiResponse): AuthSession {
  return {
    token: payload.Token,
    expiresAt: new Date(payload.ExpiresAt),
    user: mapUser(payload.User),
    branding: payload.PlatformBranding,
  };
}

export class AuthClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.NEXT_PUBLIC_API_BASE_URL;
  }

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const { audience = 'tenant', email, password } = credentials;
    console.log('AuthClient.login called with:', credentials);
    const endpoint = audience === 'platform' ? '/admin/login' : '/login';

    console.log(`Attempting login to ${this.baseUrl}${endpoint} for ${email} (audience: ${audience})`);

    const response = await fetcher.post(
      endpoint,
      {
        email,
        password,
      },
      loginResponseSchema,
    );

    console.log('Login successful, processing response');

    // Store the token for future API calls (sessionStorage for better XSS protection)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_token', response.Token);
      sessionStorage.setItem('authToken', response.Token); // Backup key
    }

    const session = mapSession(response);

    // Audit successful login
    audit('auth.login', {
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorRole: session.user.role,
      tenantId: session.user.tenantId,
      status: 'success',
      details: {
        audience,
        email: session.user.email,
      },
    }).catch(error => {
      // Don't block login if audit logging fails
      console.error('Failed to audit login:', error);
    });

    return session;
  }

  async logout(options: { audience: LoginAudience; tenantId?: string }): Promise<void> {
    const endpoint = options.audience === 'platform' ? '/admin/logout' : '/logout';

    console.log(`Attempting logout to ${this.baseUrl}${endpoint}`);

    try {
      if (options.audience === 'platform') {
        fetcher.removeTenantId();
      } else if (options.tenantId) {
        fetcher.setTenantId(options.tenantId);
      }

      await fetcher.post(endpoint);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails on server, we should clear local state
    } finally {
      // Always clear tokens from session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('authToken');
      }
    }
  }
}

export const authClient = new AuthClient();

export const authHelpers = {
  hasPermission(user: AuthUser, permission?: Permission): boolean {
    if (!permission) {
      return true;
    }

    // Use permissions from backend JWT (already in user.permissions)
    return user.permissions.includes(permission);
  },

  hasRole(user: AuthUser, role: AuthUser['role']): boolean {
    return user.role === role;
  },

  getUserInitials(user: AuthUser): string {
    return user.name
      .split(' ')
      .map((namePart) => namePart.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  },

  getDisplayName(user: AuthUser): string {
    return user.name || user.email;
  },

  isSessionExpired(session: AuthSession): boolean {
    return session.expiresAt.getTime() <= Date.now();
  },

  getSessionTimeRemaining(session: AuthSession): number {
    return Math.max(0, session.expiresAt.getTime() - Date.now());
  },
};
