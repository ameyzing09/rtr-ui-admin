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

export class TenantContextError extends Error {
  constructor(message: string, public attemptedTenantId?: string) {
    super(message);
    this.name = 'TenantContextError';
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

// ============================================================================
// Tenant Context Guards (Multi-Tenant Isolation)
// ============================================================================

/**
 * Assert that a user can access a resource from a specific tenant
 * Prevents cross-tenant data access by validating tenant context
 *
 * IMPORTANT: This is a critical security control for multi-tenant isolation.
 * - Superadmins bypass this check (they manage all tenants)
 * - Tenant users can ONLY access resources from their own tenant
 * - Backend MUST also enforce this validation (defense-in-depth)
 *
 * @param session - User session
 * @param resourceTenantId - The tenant ID that owns the resource
 * @throws TenantContextError if tenant user tries to access other tenant's resource
 *
 * @example
 * // In a job service
 * async getJob(session: UserSession, jobId: string) {
 *   assertPermission(session, PERMISSIONS.JOB_READ);
 *   const job = await fetchJob(jobId);
 *   assertTenantContext(session, job.tenantId); // Validate tenant isolation
 *   return job;
 * }
 */
export function assertTenantContext(session: UserSession, resourceTenantId: string | undefined): void {
  // Superadmins can access resources from any tenant
  if (session.role === 'SUPERADMIN') {
    return;
  }

  // Tenant users must have a tenantId
  if (!session.tenantId) {
    throw new TenantContextError(
      'User session does not have a tenant ID. This user cannot access tenant-scoped resources.',
      resourceTenantId
    );
  }

  // Resource must have a tenantId
  if (!resourceTenantId) {
    throw new TenantContextError(
      'Resource does not have a tenant ID. Cannot validate tenant context.',
      undefined
    );
  }

  // Validate tenant match
  if (session.tenantId !== resourceTenantId) {
    throw new TenantContextError(
      'Access denied: Cannot access resources from other tenants',
      resourceTenantId
    );
  }
}

/**
 * Assert that a user belongs to a specific tenant
 * Used when a tenant ID is provided directly (e.g., in URL params)
 *
 * @param session - User session
 * @param tenantId - The tenant ID being accessed
 * @throws TenantContextError if tenant user tries to access different tenant
 *
 * @example
 * // In a tenant settings endpoint
 * async getTenantSettings(session: UserSession, tenantId: string) {
 *   assertOwnTenant(session, tenantId);
 *   assertPermission(session, PERMISSIONS.SETTINGS_READ);
 *   return await fetchTenantSettings(tenantId);
 * }
 */
export function assertOwnTenant(session: UserSession, tenantId: string): void {
  // Superadmins can access any tenant
  if (session.role === 'SUPERADMIN') {
    return;
  }

  // Tenant users must have a tenantId
  if (!session.tenantId) {
    throw new TenantContextError(
      'User session does not have a tenant ID. This user cannot access tenant-scoped operations.',
      tenantId
    );
  }

  // Validate tenant match
  if (session.tenantId !== tenantId) {
    throw new TenantContextError(
      `Access denied: Cannot access tenant ${tenantId}. You can only access your own tenant (${session.tenantId})`,
      tenantId
    );
  }
}

/**
 * Assert tenant context for a resource object
 * Generic helper for objects with a tenantId property
 *
 * @param session - User session
 * @param resource - The resource object (must have tenantId property)
 * @throws TenantContextError if tenant user tries to access other tenant's resource
 *
 * @example
 * // Works with any resource type that has tenantId
 * async getApplication(session: UserSession, applicationId: string) {
 *   assertPermission(session, PERMISSIONS.APPLICATION_READ);
 *   const application = await fetchApplication(applicationId);
 *   assertTenantResource(session, application);
 *   return application;
 * }
 */
export function assertTenantResource<T extends { tenantId?: string }>(
  session: UserSession,
  resource: T
): void {
  assertTenantContext(session, resource.tenantId);
}

/**
 * Check if user can access a resource from a specific tenant (non-throwing)
 * Useful for conditional rendering or filtering
 *
 * @param session - User session
 * @param resourceTenantId - The tenant ID that owns the resource
 * @returns true if user can access the resource
 */
export function canAccessTenant(session: UserSession, resourceTenantId: string | undefined): boolean {
  try {
    assertTenantContext(session, resourceTenantId);
    return true;
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
