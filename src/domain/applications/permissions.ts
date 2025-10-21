import { PERMISSIONS, can } from '@/lib/rbac/permissions';
import type { Permission } from '@/lib/rbac/permissions';

// ============================================================================
// Permission Constants
// ============================================================================

/**
 * Application-related permissions from RBAC system
 * Aligned with backend permission definitions
 */
export const APPLICATION_PERMISSIONS = {
  LIST: PERMISSIONS.APPLICATION_LIST,
  CREATE: PERMISSIONS.APPLICATION_CREATE,
  READ: PERMISSIONS.APPLICATION_READ,
  UPDATE: PERMISSIONS.APPLICATION_UPDATE,
  DELETE: PERMISSIONS.APPLICATION_DELETE,
} as const;

// ============================================================================
// Permission Helpers
// ============================================================================

/**
 * Check if user has a specific application permission
 */
export function hasApplicationPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return can(userPermissions, requiredPermission);
}

/**
 * Check if user can perform any application operation
 */
export function canManageApplications(userPermissions: Permission[]): boolean {
  return Object.values(APPLICATION_PERMISSIONS).some((perm) =>
    can(userPermissions, perm)
  );
}

// ============================================================================
// Permission Guards (See permissions.server.ts)
// ============================================================================

/**
 * NOTE: Server-side application permission checks have been moved to permissions.server.ts
 *
 * Server-only functions (require authentication):
 * - requireCanListApplications()
 * - requireCanCreateApplications()
 * - requireCanUpdateApplications()
 * - requireCanDeleteApplications()
 *
 * Import from permissions.server.ts in server-only contexts (server components, actions).
 */
