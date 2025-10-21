import { PERMISSIONS, can } from '@/lib/rbac/permissions';
import type { Permission } from '@/lib/rbac/permissions';

/**
 * Pipeline permissions from RBAC system
 * Note: CREATE and ASSIGN require ADMIN or HR role per API requirements
 */
export const PIPELINE_PERMISSIONS = {
  LIST: PERMISSIONS.PIPELINE_LIST,
  CREATE: PERMISSIONS.PIPELINE_CREATE,
  READ: PERMISSIONS.PIPELINE_READ,
  UPDATE: PERMISSIONS.PIPELINE_UPDATE,
  DELETE: PERMISSIONS.PIPELINE_DELETE,
  ASSIGN: PERMISSIONS.PIPELINE_ASSIGN,
} as const;

/**
 * NOTE: Server-side pipeline permission checks have been moved to permissions.server.ts
 *
 * Server-only functions (require authentication):
 * - requirePipelinePermission()
 * - requireCanListPipelines()
 * - requireCanCreatePipelines()
 * - requireCanReadPipelines()
 * - requireCanUpdatePipelines()
 * - requireCanDeletePipelines()
 * - requireCanAssignPipelines()
 * - requireCanManagePipelines()
 *
 * Import from permissions.server.ts in server-only contexts (server components, actions).
 */

/**
 * Client-side permission check (non-throwing)
 * Use this in UI components to conditionally render elements
 */
export function hasPipelinePermission(
  userPermissions: Permission[],
  permission: Permission
): boolean {
  return can(userPermissions, permission);
}

/**
 * Check if user has all pipeline permissions
 */
export function hasAllPipelinePermissions(userPermissions: Permission[]): boolean {
  return (
    can(userPermissions, PIPELINE_PERMISSIONS.LIST) &&
    can(userPermissions, PIPELINE_PERMISSIONS.CREATE) &&
    can(userPermissions, PIPELINE_PERMISSIONS.READ) &&
    can(userPermissions, PIPELINE_PERMISSIONS.UPDATE) &&
    can(userPermissions, PIPELINE_PERMISSIONS.DELETE) &&
    can(userPermissions, PIPELINE_PERMISSIONS.ASSIGN)
  );
}
