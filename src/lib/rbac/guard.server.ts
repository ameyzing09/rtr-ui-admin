'use server';

/**
 * Server-Only Permission Guards
 *
 * This file contains server-side functions that use Next.js server-only APIs
 * like cookies() and redirect(). These functions are used in server components
 * and server actions to enforce permission checks before rendering pages or
 * executing actions.
 *
 * NOTE: This is a separate file to prevent module contamination.
 * Client components should NOT import from this file.
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Permission } from './permissions';
import { can, canAll } from './permissions';
import type { UserSession } from './guard';

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

    if (!sessionCookie || !sessionCookie.value || sessionCookie.value.trim() === '') {
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

    let sessionData: SessionCookieData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch {
      // Session cookie contains invalid JSON (corrupted or expired)
      return null;
    }

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
// Permission Guards (Server-Side)
// ============================================================================

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
// Route Protection Helpers (Server-Side)
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

// ============================================================================
// Usage Examples & Best Practices
// ============================================================================

/*
 * TENANT-SCOPED RESOURCES (Require Tenant Context Validation)
 *
 * These resources belong to a specific tenant and must include tenant context checks:
 *
 * 1. Jobs (job:*)
 *    - List jobs: Filter by session.tenantId
 *    - Get job: Validate job.tenantId === session.tenantId
 *    - Create job: Set tenantId = session.tenantId
 *    - Update/Delete job: Validate job.tenantId === session.tenantId
 *
 * 2. Applications (application:*)
 *    - All CRUD operations require tenant context validation
 *
 * 3. Pipeline (pipeline:*)
 *    - All CRUD operations require tenant context validation
 *
 * 4. Members (member:*)
 *    - List members: Filter by session.tenantId
 *    - Invite/Remove members: Validate target tenant === session.tenantId
 *
 * 5. Interviews (interview:*)
 *    - All CRUD operations require tenant context validation
 *
 * 6. Settings (settings:read, settings:update)
 *    - Get/Update tenant settings: Validate tenantId === session.tenantId
 *
 * 7. Billing (billing:*)
 *    - All billing operations: Validate tenantId === session.tenantId
 *
 * 8. Integrations (integrations:*)
 *    - All integration operations: Validate tenantId === session.tenantId
 *
 *
 * PLATFORM-SCOPED RESOURCES (No Tenant Context - Superadmin Only)
 *
 * These resources are NOT tenant-scoped and should NOT use tenant context checks:
 *
 * 1. Tenant Management (tenant:*)
 *    - Managed by superadmins only
 *    - No tenant context validation needed
 *
 * 2. System Management (sys:*)
 *    - System users, health monitoring
 *    - Superadmin only, no tenant context
 *
 * 3. Global Settings (settings:global, settings:security, settings:db)
 *    - Platform-wide settings
 *    - Superadmin only, no tenant context
 *
 *
 * IMPLEMENTATION PATTERN:
 *
 * async function getResource(session: UserSession, resourceId: string) {
 *   // 1. Check permission first
 *   assertPermission(session, PERMISSIONS.RESOURCE_READ);
 *
 *   // 2. Fetch the resource
 *   const resource = await fetchResource(resourceId);
 *
 *   // 3. Validate tenant context BEFORE returning
 *   assertTenantContext(session, resource.tenantId);
 *
 *   return resource;
 * }
 *
 * async function createResource(session: UserSession, data: CreateResourceRequest) {
 *   // 1. Check permission
 *   assertPermission(session, PERMISSIONS.RESOURCE_CREATE);
 *
 *   // 2. Set tenantId from session (tenant users) or from request (superadmin)
 *   const tenantId = session.role === 'SUPERADMIN'
 *     ? data.tenantId  // Superadmin can create for any tenant
 *     : session.tenantId; // Tenant user creates for their own tenant
 *
 *   // 3. Create resource
 *   return await createResourceInBackend({ ...data, tenantId });
 * }
 */
