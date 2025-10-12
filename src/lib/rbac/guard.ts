/**
 * Server-Side Permission Guards
 *
 * These functions are used in server components and server actions
 * to enforce permission checks before rendering pages or executing actions.
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Permission } from './permissions';
import { can, canAll } from './permissions';

// ============================================================================
// Types
// ============================================================================

export interface UserSession {
  userId: string;
  tenantId?: string;
  role: string;
  permissions: Permission[];
  email: string;
  name: string;
  token: string; // Auth token for making backend API calls
}

export class UnauthorizedError extends Error {
  constructor(message: string, public requiredPermission?: Permission) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string, public requiredPermissions?: Permission[]) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

// ============================================================================
// Session Helpers
// ============================================================================

/**
 * Get the current user session from cookies
 *
 * @returns UserSession or null if not authenticated
 */
export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('rtr-admin-session');

    if (!sessionCookie) {
      return null;
    }

    // TODO: CRITICAL SECURITY - Implement JWT validation
    // Current implementation directly parses JSON without cryptographic verification.
    // This allows clients to tamper with session data and escalate privileges.
    //
    // REQUIRED IMPLEMENTATION:
    // 1. Install JWT library: `npm install jsonwebtoken @types/jsonwebtoken`
    // 2. Get JWT secret from env: process.env.JWT_SECRET
    // 3. Verify JWT signature:
    //    ```typescript
    //    import jwt from 'jsonwebtoken';
    //    const secret = process.env.JWT_SECRET;
    //    if (!secret) throw new Error('JWT_SECRET not configured');
    //
    //    interface JWTPayload {
    //      user: {
    //        id: string;
    //        tenantId?: string;
    //        role: string;
    //        email: string;
    //        name: string;
    //        permissions?: Permission[];
    //      };
    //      token: string;
    //      expiresAt: string;
    //      permissions?: Permission[];
    //    }
    //
    //    const sessionData = jwt.verify(sessionCookie.value, secret) as JWTPayload;
    //    ```
    // 4. Handle jwt.verify() errors (JsonWebTokenError, TokenExpiredError, etc.)
    //
    // Until implemented, this is a CRITICAL security vulnerability.
    interface SessionCookieData {
      user: {
        id: string;
        tenantId?: string;
        role: string;
        email: string;
        name: string;
        permissions?: Permission[];
      };
      token: string;
      permissions?: Permission[];
    }

    const sessionData: SessionCookieData = JSON.parse(sessionCookie.value);

    // Validate required fields
    if (!sessionData.user || !sessionData.user.role) {
      return null;
    }

    // Get permissions from session or derive from role
    const permissions: Permission[] = sessionData.permissions || sessionData.user?.permissions || [];

    return {
      userId: sessionData.user.id,
      tenantId: sessionData.user.tenantId,
      role: sessionData.user.role,
      permissions,
      email: sessionData.user.email,
      name: sessionData.user.name,
      token: sessionData.token, // Include auth token for backend API calls
    };
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

/**
 * Require authentication - redirect to login if not authenticated
 *
 * @param loginPath - Path to redirect to if not authenticated (default: /login)
 * @returns UserSession
 */
export async function requireAuth(loginPath = '/login'): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    redirect(loginPath);
  }

  return session;
}

/**
 * Require superadmin role - redirect to login if not authenticated or not superadmin
 *
 * @returns UserSession
 */
export async function requireSuperadmin(): Promise<UserSession> {
  const session = await requireAuth('/login');

  if (session.role !== 'SUPERADMIN') {
    redirect('/unauthorized?reason=role');
  }

  return session;
}

// ============================================================================
// Permission Guards
// ============================================================================

/**
 * Assert that the user has a specific permission
 * Throws ForbiddenError if user doesn't have the permission
 *
 * @param session - User session
 * @param requiredPermission - The permission required
 * @throws ForbiddenError if permission check fails
 */
export function assertPermission(session: UserSession, requiredPermission: Permission): void {
  if (!can(session.permissions, requiredPermission)) {
    throw new ForbiddenError(
      `Missing required permission: ${requiredPermission}`,
      [requiredPermission]
    );
  }
}

/**
 * Assert that the user has ALL of the specified permissions
 * Throws ForbiddenError if user doesn't have all permissions
 *
 * @param session - User session
 * @param requiredPermissions - Array of permissions required
 * @throws ForbiddenError if permission check fails
 */
export function assertPermissions(session: UserSession, requiredPermissions: Permission[]): void {
  if (!canAll(session.permissions, requiredPermissions)) {
    const missing = requiredPermissions.filter(p => !session.permissions.includes(p));
    throw new ForbiddenError(
      `Missing required permissions: ${missing.join(', ')}`,
      requiredPermissions
    );
  }
}

/**
 * Require a specific permission - redirect to unauthorized page if user doesn't have it
 *
 * @param requiredPermission - The permission required
 * @param session - Optional session (will fetch if not provided)
 * @returns UserSession
 */
export async function requirePermission(
  requiredPermission: Permission,
  session?: UserSession
): Promise<UserSession> {
  const userSession = session || await requireAuth();

  if (!can(userSession.permissions, requiredPermission)) {
    redirect(`/unauthorized?reason=permission&required=${requiredPermission}`);
  }

  return userSession;
}

/**
 * Require ALL of the specified permissions
 *
 * @param requiredPermissions - Array of permissions required
 * @param session - Optional session (will fetch if not provided)
 * @returns UserSession
 */
export async function requirePermissions(
  requiredPermissions: Permission[],
  session?: UserSession
): Promise<UserSession> {
  const userSession = session || await requireAuth();

  if (!canAll(userSession.permissions, requiredPermissions)) {
    const missing = requiredPermissions.filter(p => !userSession.permissions.includes(p));
    redirect(`/unauthorized?reason=permissions&required=${missing.join(',')}`);
  }

  return userSession;
}

// ============================================================================
// Route Protection Helpers
// ============================================================================

/**
 * Protect a superadmin route - requires SUPERADMIN role and specific permission
 *
 * @param requiredPermission - Optional permission required beyond SUPERADMIN role
 * @returns UserSession
 */
export async function protectSuperadminRoute(requiredPermission?: Permission): Promise<UserSession> {
  const session = await requireSuperadmin();

  if (requiredPermission) {
    await requirePermission(requiredPermission, session);
  }

  return session;
}

/**
 * Protect a tenant route - requires authentication and specific permission
 *
 * @param requiredPermission - The permission required
 * @returns UserSession
 */
export async function protectTenantRoute(requiredPermission: Permission): Promise<UserSession> {
  return await requirePermission(requiredPermission);
}

/**
 * Check if user has permission without throwing/redirecting
 * Useful for conditional rendering in server components
 *
 * @param requiredPermission - The permission to check
 * @param session - Optional session (will fetch if not provided)
 * @returns true if user has permission
 */
export async function hasPermission(
  requiredPermission: Permission,
  session?: UserSession
): Promise<boolean> {
  try {
    const userSession = session || await getSession();
    if (!userSession) return false;
    return can(userSession.permissions, requiredPermission);
  } catch {
    return false;
  }
}

/**
 * Check if user has ALL of the specified permissions
 *
 * @param requiredPermissions - Array of permissions to check
 * @param session - Optional session (will fetch if not provided)
 * @returns true if user has all permissions
 */
export async function hasPermissions(
  requiredPermissions: Permission[],
  session?: UserSession
): Promise<boolean> {
  try {
    const userSession = session || await getSession();
    if (!userSession) return false;
    return canAll(userSession.permissions, requiredPermissions);
  } catch {
    return false;
  }
}
