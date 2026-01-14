import { z } from 'zod';
import { Fetcher } from './fetcher';
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
  ForcePasswordReset: z.boolean().default(false),
  Permissions: z.array(z.string()).default([]),
});

// Branding schema for both tenant and platform branding
// Backend returns:
// - TenantBranding for tenant user logins
// - PlatformBranding for superadmin logins
const brandingSchema = z.object({
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
  TenantBranding: brandingSchema.nullable(),
  PlatformBranding: brandingSchema.nullable(),
});

type LoginApiResponse = z.infer<typeof loginResponseSchema>;

function mapUser(user: LoginApiResponse['User']): AuthUser {
  return {
    id: user.ID,
    tenantId: user.TenantID,
    name: user.Name,
    email: user.Email,
    role: user.Role,
    mustChangePassword: user.ForcePasswordReset ?? false,
    permissions: (user.Permissions || []) as Permission[],
  };
}

function mapSession(payload: LoginApiResponse): AuthSession {
  // Use TenantBranding for tenant users, PlatformBranding for superadmins
  // Handle null values from API
  const branding = payload.TenantBranding || payload.PlatformBranding || undefined;

  return {
    token: payload.Token,
    expiresAt: new Date(payload.ExpiresAt),
    user: mapUser(payload.User),
    branding,
  };
}

export class AuthClient {
  private fetcher: Fetcher;

  constructor() {
    // Create dedicated fetcher for User-Auth service
    // NEXT_PUBLIC_ prefix allows browser access (needed for login forms)
    const baseUrl = process.env.NEXT_PUBLIC_USER_AUTH_API_BASE_URL ||
                    process.env.USER_AUTH_API_BASE_URL ||
                    process.env.AUTH_API_BASE ||
                    env.NEXT_PUBLIC_API_BASE_URL ||
                    'http://localhost:8082';
    console.log(`AuthClient initialized with baseUrl: ${baseUrl}`);
    this.fetcher = new Fetcher({ baseUrl });
  }

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const { audience = 'tenant', email, password } = credentials;
    const endpoint = audience === 'platform' ? '/admin/login' : '/login';

    const response = await this.fetcher.post(
      endpoint,
      {
        email,
        password,
      },
      loginResponseSchema,
    );

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

  async logout(options: { audience: LoginAudience; tenantId?: string; token?: string }): Promise<void> {
    const endpoint = options.audience === 'platform' ? '/admin/logout' : '/logout';

    console.log(`Attempting logout to endpoint: ${endpoint}`);

    try {
      // Set Authorization header if token is provided
      // This is required for the backend to authenticate the logout request
      if (options.token) {
        this.fetcher.setAuthToken(options.token);
      }

      // Tenant context is automatically derived from JWT by backend
      // No need to set/remove tenant headers
      await this.fetcher.post(endpoint);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails on server, we should clear local state
    }
    // Note: Token cleanup is handled by AuthProvider
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

  /**
   * Check if the token is expiring soon (within threshold)
   * Useful for proactive token refresh or warning users
   * @param session - Current auth session
   * @param thresholdMinutes - Minutes before expiration to consider "expiring soon" (default: 5)
   * @returns true if token expires within the threshold
   */
  isTokenExpiringSoon(session: AuthSession, thresholdMinutes = 5): boolean {
    const now = Date.now();
    const expiryTime = session.expiresAt.getTime();
    const threshold = thresholdMinutes * 60 * 1000;
    const timeToExpiry = expiryTime - now;
    return timeToExpiry < threshold && timeToExpiry > 0;
  },

  /**
   * Get human-readable time remaining until token expiration
   * @param session - Current auth session
   * @returns String like "5 minutes" or "2 hours"
   */
  getTimeRemainingDisplay(session: AuthSession): string {
    const ms = this.getSessionTimeRemaining(session);
    if (ms <= 0) return 'Expired';

    const minutes = Math.floor(ms / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'Less than a minute';
  },
};
