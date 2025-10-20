/**
 * Permission Guard Types and Client-Safe Utilities
 *
 * This file exports types and client-safe permission checking functions
 * that can be used in both server and client contexts.
 *
 * For server-only functions that use next/headers or redirect,
 * see guard.server.ts
 */

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
// Session Helpers (See guard.server.ts for server-only functions)
// ============================================================================

/**
 * NOTE: Server-side session functions (getSession, requireAuth, requireSuperadmin)
 * have been moved to guard.server.ts to avoid module contamination.
 *
 * Import from guard.server.ts if you need these functions in a server context.
 */

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
 * NOTE: Server-side permission checking functions (requirePermission, requirePermissions,
 * protectSuperadminRoute, protectTenantRoute, hasPermission, hasPermissions) have been
 * moved to guard.server.ts to avoid module contamination.
 *
 * Import from guard.server.ts if you need these functions in a server context.
 */

// ============================================================================
// Route Protection Helpers (See guard.server.ts)
// ============================================================================

/**
 * NOTE: Route protection helpers have been moved to guard.server.ts
 */

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

