
// ============================================================================
// Permission Constants
// ============================================================================

/**
 * Application-related permissions
 * These should match the permission strings in your RBAC system
 */
export const APPLICATION_PERMISSIONS = {
  VIEW: 'applications:view',
  CREATE: 'applications:create',
  UPDATE: 'applications:update',
  DELETE: 'applications:delete',
} as const;

// ============================================================================
// Permission Helpers
// ============================================================================

/**
 * Check if user has a specific application permission
 */
export function hasApplicationPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if user can perform any application operation
 */
export function canManageApplications(userPermissions: string[]): boolean {
  return Object.values(APPLICATION_PERMISSIONS).some((perm) =>
    userPermissions.includes(perm)
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
