import { PERMISSIONS, can } from '@/lib/rbac/permissions';
import type { Permission } from '@/lib/rbac/permissions';

/**
 * Job permissions from RBAC system
 * Note: PUBLISH and UNPUBLISH require ADMIN or HR role
 */
export const JOB_PERMISSIONS = {
  LIST: PERMISSIONS.JOB_LIST,
  CREATE: PERMISSIONS.JOB_CREATE,
  READ: PERMISSIONS.JOB_READ,
  UPDATE: PERMISSIONS.JOB_UPDATE,
  DELETE: PERMISSIONS.JOB_DELETE,
  PUBLISH: PERMISSIONS.JOB_PUBLISH,
  UNPUBLISH: PERMISSIONS.JOB_UNPUBLISH,
} as const;

/**
 * NOTE: Server-side job permission checks have been moved to permissions.server.ts
 *
 * Server-only functions (require authentication):
 * - requireJobPermission()
 * - requireCanListJobs()
 * - requireCanCreateJobs()
 * - requireCanReadJobs()
 * - requireCanUpdateJobs()
 * - requireCanDeleteJobs()
 * - requireCanPublishJobs()
 * - requireCanUnpublishJobs()
 * - requireCanManageJobs()
 * - requireCanManageJobPublishing()
 *
 * Import from permissions.server.ts in server-only contexts (server components, actions).
 */

/**
 * Client-side permission check (non-throwing)
 * Use this in UI components to conditionally render elements
 */
export function hasJobPermission(
  userPermissions: Permission[],
  permission: Permission
): boolean {
  return can(userPermissions, permission);
}

/**
 * Check if user has all job permissions
 */
export function hasAllJobPermissions(userPermissions: Permission[]): boolean {
  return (
    can(userPermissions, JOB_PERMISSIONS.LIST) &&
    can(userPermissions, JOB_PERMISSIONS.CREATE) &&
    can(userPermissions, JOB_PERMISSIONS.READ) &&
    can(userPermissions, JOB_PERMISSIONS.UPDATE) &&
    can(userPermissions, JOB_PERMISSIONS.DELETE)
  );
}
