import { requireAuth } from '@/lib/rbac/guard';
import { PERMISSIONS, can } from '@/lib/rbac/permissions';
import type { Permission } from '@/lib/rbac/permissions';
import type { AuthSession } from '@/lib/auth/types';

/**
 * Job permissions from RBAC system
 */
export const JOB_PERMISSIONS = {
  LIST: PERMISSIONS.JOB_LIST,
  CREATE: PERMISSIONS.JOB_CREATE,
  READ: PERMISSIONS.JOB_READ,
  UPDATE: PERMISSIONS.JOB_UPDATE,
  DELETE: PERMISSIONS.JOB_DELETE,
} as const;

/**
 * Require user to have a specific job permission
 * Throws UnauthorizedError if user doesn't have permission
 *
 * @param permission - The required job permission
 * @returns The authenticated session
 */
export async function requireJobPermission(permission: Permission): Promise<AuthSession> {
  const session = await requireAuth();

  if (!can(session.user.permissions, permission)) {
    throw new Error(`Missing required permission: ${permission}`);
  }

  return session;
}

/**
 * Check if user can list jobs
 * @returns The authenticated session
 */
export async function requireCanListJobs(): Promise<AuthSession> {
  return requireJobPermission(JOB_PERMISSIONS.LIST);
}

/**
 * Check if user can create jobs
 * @returns The authenticated session
 */
export async function requireCanCreateJobs(): Promise<AuthSession> {
  return requireJobPermission(JOB_PERMISSIONS.CREATE);
}

/**
 * Check if user can read job details
 * @returns The authenticated session
 */
export async function requireCanReadJobs(): Promise<AuthSession> {
  return requireJobPermission(JOB_PERMISSIONS.READ);
}

/**
 * Check if user can update jobs
 * @returns The authenticated session
 */
export async function requireCanUpdateJobs(): Promise<AuthSession> {
  return requireJobPermission(JOB_PERMISSIONS.UPDATE);
}

/**
 * Check if user can delete jobs
 * @returns The authenticated session
 */
export async function requireCanDeleteJobs(): Promise<AuthSession> {
  return requireJobPermission(JOB_PERMISSIONS.DELETE);
}

/**
 * Check if user can manage jobs (create, update, delete)
 * @returns The authenticated session
 */
export async function requireCanManageJobs(): Promise<AuthSession> {
  const session = await requireAuth();

  const canManage =
    can(session.user.permissions, JOB_PERMISSIONS.CREATE) &&
    can(session.user.permissions, JOB_PERMISSIONS.UPDATE) &&
    can(session.user.permissions, JOB_PERMISSIONS.DELETE);

  if (!canManage) {
    throw new Error('Missing required permissions to manage jobs');
  }

  return session;
}

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
