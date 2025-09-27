import { z } from 'zod';
import { fetcher } from './fetcher';
import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  LoginAudience,
  Permission,
} from '@/lib/auth/types';
import { rolePermissions } from '@/lib/auth/permissions';

const apiUserSchema = z.object({
  ID: z.string(),
  TenantID: z.string(),
  Name: z.string(),
  Email: z.string().email(),
  Role: z.enum(['SUPERADMIN', 'ADMIN', 'HR', 'INTERVIEWER', 'CANDIDATE']),
  MustChangePassword: z.boolean().default(false),
});

const loginResponseSchema = z.object({
  Token: z.string(),
  ExpiresAt: z.string(),
  User: apiUserSchema,
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
  };
}

function mapSession(payload: LoginApiResponse): AuthSession {
  return {
    token: payload.Token,
    expiresAt: new Date(payload.ExpiresAt),
    user: mapUser(payload.User),
  };
}

export class AuthClient {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const { audience = 'tenant', email, password } = credentials;
    const endpoint = audience === 'platform' ? '/admin/login' : '/login';

    const response = await fetcher.post(
      endpoint,
      {
        email,
        password,
      },
      loginResponseSchema,
    );

    return mapSession(response);
  }

  async logout(options: { audience: LoginAudience; tenantId?: string }): Promise<void> {
    const endpoint = options.audience === 'platform' ? '/admin/logout' : '/logout';

    if (options.audience === 'platform') {
      fetcher.removeTenantId();
    } else if (options.tenantId) {
      fetcher.setTenantId(options.tenantId);
    }

    await fetcher.post(endpoint);
  }
}

export const authClient = new AuthClient();

export const authHelpers = {
  hasPermission(user: AuthUser, permission?: Permission): boolean {
    if (!permission) {
      return true;
    }
    
    // Get the user's role permissions
    const userPermissions = rolePermissions[user.role] || [];
    
    // Check if the user has the specific permission
    return userPermissions.includes(permission);
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
